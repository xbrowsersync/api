import * as bunyan from 'bunyan';
import { autobind } from 'core-decorators';
import * as cors from 'cors';
import * as express from 'express';
import * as fs from 'fs';
import * as helmet from 'helmet';
import * as http from 'http';
import * as https from 'https';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import BookmarksRouter from './bookmarksRouter';
import BookmarksService from './bookmarksService';
import DB from './db';
import {
  ExceptionBase,
  NotImplementedException,
  OriginNotPermittedException,
  ServiceNotAvailableException,
  UnspecifiedException
} from './exception';
import InfoRouter from './infoRouter';
import InfoService from './infoService';
import NewSyncLogsService from './newSyncLogsService';
const Config = require('./config.json');

export enum ApiStatus {
  online = 1,
  offline = 2,
  noNewSyncs = 3
}

export enum ApiVerb {
  delete = 'delete',
  get = 'get',
  options = 'options',
  patch = 'patch',
  post = 'post',
  put = 'put'
}

export enum LogLevel {
  Error,
  Info
}

// Main class for the xBrowserSync api service
export default class Server {
  // Throws an error if the service status is set to offline in config
  public static checkServiceAvailability(): void {
    if (!Config.status.online) {
      throw new ServiceNotAvailableException();
    }
  }

  private app: express.Application;
  private bookmarksService: BookmarksService;
  private db: DB;
  private infoService: InfoService;
  private logger: bunyan;
  private logToConsole = true;
  private newSyncLogsService: NewSyncLogsService;
  private rateLimit = require('express-rate-limit');
  private server: http.Server | https.Server;

  public getApplication(): express.Application {
    return this.app;
  }

  // Initialises the xBrowserSync api service when a new instance is created
  public async init(): Promise<void> {
    try {
      this.configureServer();
      this.prepareDataServices();
      this.prepareRoutes();
      this.app.use(this.handleErrors);

      // Establish database connection
      await this.connectToDb();
    }
    catch (err) {
      this.log(LogLevel.Error, `Service failed to start`, null, err);
      process.exit(1);
    }
  }

  // Logs messages and errors to console and to file (if enabled)
  @autobind
  public log(level: LogLevel, message: string, req?: express.Request, err?: Error): void {
    switch (level) {
      case LogLevel.Error:
        if (Config.log.enabled) {
          this.logger.error({ req, err }, message);
        }
        if (this.logToConsole) {
          console.error(err ? `${message}: ${err.message}` : message);
        }
        break;
      case LogLevel.Info:
        if (Config.log.enabled) {
          this.logger.info({ req }, message);
        }
        if (this.logToConsole) {
          console.log(message);
        }
        break;
    }
  }

  // Enables/disables logging messages to the console
  public logToConsoleEnabled(logToConsole: boolean): void {
    this.logToConsole = logToConsole;
  }
  
  // Starts the api service
  @autobind
  public async start(): Promise<void> {
    // Create https server if enabled in config, otherwise create http server
    if (Config.server.https.enabled) {
      const options: https.ServerOptions = {
        cert: fs.readFileSync(Config.server.https.certPath),
        key: fs.readFileSync(Config.server.https.keyPath)
      };
      this.server = https.createServer(options, this.app);
    }
    else {
      this.server = http.createServer(this.app);
    }
    this.server.listen(Config.server.port);

    // Wait for server to start before continuing
    await new Promise((resolve, reject) => {
      this.server.on('close', conn => {
        this.log(LogLevel.Info, `Service terminating.`);
      });

      this.server.on('error', (err: NodeJS.ErrnoException) => {
        this.log(LogLevel.Error, `Uncaught exception occurred`, null, err);
        this.server.close();
      });

      this.server.on('listening', async conn => {
        this.log(LogLevel.Info, `Service started on ${Config.server.host}:${Config.server.port}`);
        resolve();
      });
    });
  }

  // Stops the api service
  public async stop(): Promise<void> {
    await new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  // Initialises the express application and middleware
  private configureServer(): void {
    this.app = express();

    // Add logging if required
    if (Config.log.enabled) {
      // Ensure log directory exists
      const logDirectory = Config.log.path.substring(0, Config.log.path.lastIndexOf('/'));
      if (!fs.existsSync(logDirectory)) {
        mkdirp.sync(logDirectory);
      }

      // Delete the log file if it exists
      if (fs.existsSync(Config.log.path)) {
        fs.unlinkSync(Config.log.path);
      }

      // Initialise bunyan logger
      this.logger = bunyan.createLogger({
        level: Config.log.level,
        name: Config.log.name,
        serializers: bunyan.stdSerializers,
        streams: [
          {
            level: Config.log.level,
            path: Config.log.path
          }
        ]
      });
    }

    // Set default config for helmet security hardening
    const helmetConfig: helmet.IHelmetConfiguration = {
      noCache: true
    };

    // Configure hpkp for helmet if enabled
    if (Config.server.hpkp.enabled) {
      if (!Config.server.https.enabled) {
        throw new Error('HTTPS must be enabled when using HPKP');
      }

      if (Config.server.hpkp.sha256s.length < 2) {
        throw new Error('At least two public keys are required when using HPKP');
      }

      helmetConfig.hpkp = {
        maxAge: Config.server.hpkp.maxAge,
        sha256s: Config.server.hpkp.sha256s
      };
    }
    this.app.use(helmet(helmetConfig));

    // Add default version to request if not supplied
    this.app.use((req: any, res: express.Response, next: express.NextFunction) => {
      req.version = req.headers['accept-version'] || Config.version;
      next();
    });

    // If behind proxy use 'X-Forwarded-For' header for client ip address
    if (Config.server.behindProxy) {
      this.app.enable('trust proxy');
    }

    // Process JSON-encoded bodies, set body size limit to config value or default to 500kb
    this.app.use(express.json({
      limit: Config.maxSyncSize || 512000
    }));

    // Enable support for CORS
    const corsOptions: cors.CorsOptions =
      Config.allowedOrigins.length > 0 && {
        origin: (origin, callback) => {
          if (Config.allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            const err = new OriginNotPermittedException();
            callback(err);
          }
        }
      };
    this.app.use(cors(corsOptions));
    this.app.options('*', cors(corsOptions));

    // Add thottling if enabled
    if (Config.throttle.maxRequests > 0) {
      this.app.use(new this.rateLimit({
        delayMs: 0,
        max: Config.throttle.maxRequests,
        windowMs: Config.throttle.timeWindow
      }));
    }
  }

  // Initialises and connects to mongodb
  private async connectToDb(): Promise<void> {
    this.db = new DB(this.log);
    await this.db.connect();
  }

  // Handles and logs api errors
  private handleErrors(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    if (err) {
      let responseObj: any;

      // If the error is one of our exception, get the reponse object to return to the client
      // otherwise create a new unspecified exception and use that 
      if (err instanceof ExceptionBase) {
        responseObj = (err as ExceptionBase).getResponseObject();
      }
      else {
        err = new UnspecifiedException();
        responseObj = (err as UnspecifiedException).getResponseObject();
      }

      res.status(err.status || 500);
      res.json(responseObj);
    }
  }

  // Initialise data services
  private prepareDataServices(): void {
    this.newSyncLogsService = new NewSyncLogsService(null, this.log);
    this.bookmarksService = new BookmarksService(this.newSyncLogsService, this.log);
    this.infoService = new InfoService(this.bookmarksService, this.log);
  }

  // Configures api routing
  private prepareRoutes(): void {
    const router = express.Router();
    this.app.use('/', router);

    // Configure bookmarks routing
    const bookmarksRouter = new BookmarksRouter(this.bookmarksService);
    this.app.use('/bookmarks', bookmarksRouter.router);

    // Configure info routing
    const infoRouter = new InfoRouter(this.infoService);
    this.app.use('/info', infoRouter.router);

    // Configure static route for documentation
    this.app.use('/', express.static(path.join(__dirname, 'docs')));

    // Handle all other routes with 404 error
    this.app.use((req, res, next) => {
      const err = new NotImplementedException();
      next(err);
    });
  }
}