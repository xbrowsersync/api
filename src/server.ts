import bunyan from 'bunyan';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import helmet from 'helmet';
import http from 'http';
import https from 'https';
import mkdirp from 'mkdirp';
import noCache from 'nocache';
import { LogLevel } from './common/enums';
import * as Config from './config';
import * as DB from './db';
import {
  ApiException,
  NotImplementedException,
  OriginNotPermittedException,
  RequestThrottledException,
  SyncDataLimitExceededException,
  UnspecifiedException,
} from './exception';
import * as Location from './location';
import { BookmarksRouter } from './routers/bookmarks.router';
import { DocsRouter } from './routers/docs.router';
import { InfoRouter } from './routers/info.router';
import { BookmarksService } from './services/bookmarks.service';
import { InfoService } from './services/info.service';
import { NewSyncLogsService } from './services/newSyncLogs.service';

let logger: bunyan;

// Cleans up server connections when stopping the service
export const cleanupServer = async (server: http.Server | https.Server): Promise<void> => {
  logMessage(LogLevel.Info, `Service shutting down`);
  await DB.disconnect();
  server.removeAllListeners();
  process.removeAllListeners();
};

// Creates a new express application, configures routes and connects to the database
export const createApplication = async (): Promise<express.Express> => {
  const app = express();

  try {
    initApplication(app);
    initRoutes(app);
    app.use(handleError);

    // Establish database connection
    await DB.connect(logMessage);
  } catch (err) {
    logMessage(LogLevel.Error, `Couldn't create application`, null, err);
    return process.exit(1);
  }

  return app;
};

// Creates a new bunyan logger for the module
export const createLogger = (logStreams: bunyan.Stream[]): void => {
  try {
    logger = bunyan.createLogger({
      name: 'xBrowserSync_api',
      serializers: bunyan.stdSerializers,
      streams: logStreams,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to initialise logger.`);
    throw err;
  }
};

// Handles and logs api errors
export const handleError = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (res.headersSent) {
    return next(err);
  }

  // Determine the response value based on the error thrown
  let responseObj: any;
  switch (true) {
    // If the error is one of our exceptions get the reponse object to return to the client
    case err instanceof ApiException:
      responseObj = (err as ApiException).getResponseObject();
      break;
    // If the error is 413 Request Entity Too Large return a SyncDataLimitExceededException
    case err.status === 413:
      err = new SyncDataLimitExceededException();
      responseObj = (err as SyncDataLimitExceededException).getResponseObject();
      break;
    // Otherwise return an UnspecifiedException
    default:
      err = new UnspecifiedException();
      responseObj = (err as UnspecifiedException).getResponseObject();
  }

  res.status(err.status || 500);
  if (req.accepts('json')) {
    res.json(responseObj);
    return;
  }
  next(responseObj);
};

// Initialises the express application and middleware
export const initApplication = (app: express.Express): void => {
  const logStreams = [];

  // Enabled logging to stdout if required
  if (Config.get().log.stdout.enabled) {
    // Add file log stream
    logStreams.push({
      level: Config.get().log.stdout.level,
      stream: process.stdout,
    });
  }

  // Enable logging to file if required
  if (Config.get().log.file.enabled) {
    try {
      // Ensure log directory exists
      const logDirectory = Config.get().log.file.path.substring(0, Config.get().log.file.path.lastIndexOf('/'));
      if (!fs.existsSync(logDirectory)) {
        mkdirp.sync(logDirectory);
      }

      // Add file log stream
      logStreams.push({
        count: Config.get().log.file.rotatedFilesToKeep,
        level: Config.get().log.file.level,
        path: Config.get().log.file.path,
        period: Config.get().log.file.rotationPeriod,
        type: 'rotating-file',
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to initialise log file.`);
      throw err;
    }
  }

  if (logStreams.length > 0) {
    // Initialise bunyan logger
    createLogger(logStreams);
  }

  // Create helmet config for security hardening
  app.use(helmet());
  app.use(noCache());

  // Add default version to request if not supplied
  app.use((req: any, res: express.Response, next: express.NextFunction) => {
    req.version = req.headers['accept-version'] || Config.get().version;
    next();
  });

  // If behind proxy use 'X-Forwarded-For' header for client ip address
  if (Config.get().server.behindProxy) {
    app.enable('trust proxy');
  }

  // Process JSON-encoded bodies, set body size limit to config value or default to 500kb
  app.use(
    express.json({
      limit: Config.get().maxSyncSize || 512000,
    })
  );

  // Enable support for CORS
  const corsOptions: cors.CorsOptions =
    Config.get().allowedOrigins.length > 0
      ? {
          origin: (origin, callback) => {
            if (Config.get().allowedOrigins.indexOf(origin) !== -1) {
              callback(null, true);
            } else {
              const err = new OriginNotPermittedException();
              callback(err);
            }
          },
        }
      : undefined;
  app.use(cors(corsOptions));

  // Add thottling if enabled
  if (Config.get().throttle.maxRequests > 0) {
    app.use(
      rateLimit({
        handler: (req, res, next) => {
          next(new RequestThrottledException());
        },
        max: Config.get().throttle.maxRequests,
        windowMs: Config.get().throttle.timeWindow,
      })
    );
  }
};

// Configures api routing
export const initRoutes = (app: express.Express): void => {
  const router = express.Router();
  app.use(Config.get().server.relativePath, router);

  // Initialise services
  const newSyncLogsService = new NewSyncLogsService(null, logMessage);
  const bookmarksService = new BookmarksService(newSyncLogsService, logMessage);
  const infoService = new InfoService(bookmarksService, logMessage);

  // Initialise routes
  const docsRouter = new DocsRouter(app);
  const bookmarkRouter = new BookmarksRouter(app, bookmarksService);
  const infoRouter = new InfoRouter(app, infoService);

  // Handle all other routes with 404 error
  app.use((req, res, next) => {
    const err = new NotImplementedException();
    next(err);
  });
};

// Logs messages and errors to console and to file (if enabled)
export const logMessage = (level: LogLevel, message: string, req?: express.Request, err?: Error): void => {
  if (!logger) {
    return;
  }

  switch (level) {
    case LogLevel.Error:
      logger.error({ req, err }, message);
      break;
    case LogLevel.Info:
    default:
      logger.info({ req }, message);
      break;
  }
};

// Starts the api service
export const startService = async (app: express.Application): Promise<http.Server | https.Server> => {
  // Check if location is valid before starting
  if (!Location.validateLocationCode(Config.get().location)) {
    logMessage(LogLevel.Error, `Location is not a valid country code, exiting`);
    return process.exit(1);
  }

  // Create https server if enabled in config, otherwise create http server
  let server: http.Server | https.Server;
  const serverListening = () => {
    const protocol = Config.get().server.https.enabled ? 'https' : 'http';
    const url = `${protocol}://${Config.get().server.host}:${Config.get().server.port}${
      Config.get().server.relativePath
    }`;
    logMessage(LogLevel.Info, `Service started at ${url}`);
  };
  if (Config.get().server.https.enabled) {
    const options: https.ServerOptions = {
      cert: fs.readFileSync(Config.get().server.https.certPath),
      key: fs.readFileSync(Config.get().server.https.keyPath),
    };
    server = https.createServer(options, app).listen(Config.get().server.port, null, serverListening);
  } else {
    server = http.createServer(app).listen(Config.get().server.port, null, serverListening);
  }

  // Catches ctrl+c event
  process.on('SIGINT', () => {
    logMessage(LogLevel.Info, `Process terminated by SIGINT`, null, null);
    server.close(async () => {
      await cleanupServer(server);
      return process.exit(0);
    });
  });

  // Catches kill pid event
  process.on('SIGUSR1', () => {
    logMessage(LogLevel.Info, `Process terminated by SIGUSR1`, null, null);
    server.close(async () => {
      await cleanupServer(server);
      return process.exit(0);
    });
  });

  // Catches kill pid event
  process.on('SIGUSR2', () => {
    logMessage(LogLevel.Info, `Process terminated by SIGUSR2`, null, null);
    server.close(async () => {
      await cleanupServer(server);
      return process.exit(0);
    });
  });

  return server;
};

// Stops the api service
export const stopService = (server: http.Server | https.Server): Promise<void> => {
  return new Promise((resolve) => {
    server.close(async () => {
      await cleanupServer(server);
      resolve();
    });
  });
};
