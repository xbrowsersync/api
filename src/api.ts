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
import InfoRouter from './infoRouter';
import InfoService from './infoService';
import NewSyncLogsService from './newSyncLogsService';

export enum ApiError {
  BookmarksDataLimitExceededError = 'BookmarksDataLimitExceededError',
  BookmarksDataNotFoundError = 'BookmarksDataNotFoundError',
  ClientIpAddressEmptyError = 'ClientIpAddressEmptyError',
  NewSyncsForbiddenError = 'NewSyncsForbiddenError',
  NewSyncsLimitExceededError = 'NewSyncsLimitExceededError',
  NotImplementedError = 'NotImplementedError',
  OriginNotPermittedError = 'OriginNotPermittedError',
  ServiceNotAvailableError = 'ServiceNotAvailableError',
  SyncIdNotFoundError = 'SyncIdNotFoundError',
  UnspecifiedError = 'UnspecifiedError',
  UnsupportedVersionError = 'UnsupportedVersionError'
}

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

// Starts a new instance of the xBrowserSync api
class API {
  private rateLimit = require('express-rate-limit');
  private config = require('./config.json');
  private bookmarksService: BookmarksService;
  private db: DB;
  private logger: bunyan;
  private app: express.Application;
  private infoService: InfoService;
  private newSyncLogsService: NewSyncLogsService;

  constructor() {
    this.init();
  }

  // Starts the api service
  public startService(): Promise<void> {
    return new Promise((resolve, reject) => {
      let server;

      // Create https server if enabled in config, otherwise create http server
      if (this.config.server.https.enabled) {
        const options: https.ServerOptions = {
          cert: fs.readFileSync(this.config.server.https.certPath),
          key: fs.readFileSync(this.config.server.https.keyPath)
        };
        server = https.createServer(options, this.app);
      }
      else {
        server = http.createServer(this.app);
      }
      server.listen(this.config.server.port);

      server.on('close', conn => {
        this.log(LogLevel.Error, `${this.config.apiName} terminating.`);
      });

      server.on('error', (err: NodeJS.ErrnoException) => {
        this.log(LogLevel.Error, `Uncaught exception occurred in ${this.config.apiName}`, null, err);
        server.close();
      });

      server.on('listening', conn => {
        this.log(LogLevel.Info, `${this.config.apiName} started on ${this.config.server.host}:${this.config.server.port}`);
        resolve();
      });
    });
  }

  // Initialises the express application and middleware
  private configureServer(): void {
    this.app = express();

    // Add logging if required
    if (this.config.log.enabled) {
      // Ensure log directory exists
      const logDirectory = this.config.log.path.substring(0, this.config.log.path.lastIndexOf('/'));
      if (!fs.existsSync(logDirectory)) {
        mkdirp.sync(logDirectory);
      }

      // Delete the log file if it exists
      if (fs.existsSync(this.config.log.path)) {
        fs.unlinkSync(this.config.log.path);
      }

      // Initialise bunyan logger
      this.logger = bunyan.createLogger({
        level: this.config.log.level,
        name: this.config.log.name,
        serializers: bunyan.stdSerializers,
        streams: [
          {
            level: this.config.log.level,
            path: this.config.log.path
          }
        ]
      });
    }

    // Set default config for helmet security hardening
    const helmetConfig: helmet.IHelmetConfiguration = {
      noCache: true
    };

    // Configure hpkp for helmet if enabled
    if (this.config.server.hpkp.enabled) {
      if (!this.config.server.https.enabled) {
        throw new Error('HTTPS must be enabled when using HPKP');
      }

      if (this.config.server.hpkp.sha256s.length < 2) {
        throw new Error('At least two public keys are required when using HPKP');
      }

      helmetConfig.hpkp = {
        maxAge: this.config.server.hpkp.maxAge,
        sha256s: this.config.server.hpkp.sha256s
      };
    }
    this.app.use(helmet(helmetConfig));

    // Add default version to request if not supplied
    this.app.use((req: any, res: express.Response, next: express.NextFunction) => {
      req.version = req.headers['accept-version'] || this.config.version;
      next();
    });

    // If behind proxy use 'X-Forwarded-For' header for client ip address
    if (this.config.server.behindProxy) {
      this.app.enable('trust proxy');
    }

    // Process JSON-encoded bodies, set body size limit to config value or default to 500kb
    this.app.use(express.json({
      limit: this.config.maxSyncSize || 512000
    }));

    // Enable support for CORS
    const corsOptions: cors.CorsOptions =
      this.config.allowedOrigins.length > 0 && {
        origin: (origin, callback) => {
          if (this.config.allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            const err = new Error();
            err.name = ApiError.OriginNotPermittedError;
            callback(err);
          }
        }
      };
    this.app.use(cors(corsOptions));
    this.app.options('*', cors(corsOptions));

    // Add thottling
    this.app.use(new this.rateLimit({
      delayMs: 0,
      max: this.config.throttle.maxRequests,
      windowMs: this.config.throttle.timeWindow
    }));
  }

  // Initialises and connects to mongodb
  private async connectToDb(): Promise<void> {
    this.db = new DB(this.log);
    await this.db.connect();
  }

  // 
  private handleErrors(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    if (err) {
      let errObj = {
        code: err.name,
        message: ''
      };

      switch (err.name) {
        case ApiError.BookmarksDataLimitExceededError:
          errObj.message = 'Bookmarks data limit exceeded';
          break;
        case ApiError.BookmarksDataNotFoundError:
          errObj.message = 'Unable to find bookmarks data';
          break;
        case ApiError.ClientIpAddressEmptyError:
          errObj.message = 'Unable to determine client\'s IP address';
          break;
        case ApiError.NewSyncsForbiddenError:
          errObj.message = 'The service is not accepting new syncs';
          break;
        case ApiError.NewSyncsLimitExceededError:
          errObj.message = 'Client has exceeded the daily new syncs limit';
          break;
        case ApiError.NotImplementedError:
          errObj.message = 'The requested route has not been implemented';
          break;
        case ApiError.OriginNotPermittedError:
          errObj.message = 'Client not permitted to access this service';
          break;
        case ApiError.ServiceNotAvailableError:
          errObj.message = 'The service is currently offline';
          break;
        case ApiError.SyncIdNotFoundError:
          errObj.message = 'Unable to find sync ID';
          break;
        case ApiError.UnsupportedVersionError:
          errObj.message = 'The requested API version is not supported';
          break;
        default:
          errObj = {
            code: ApiError.UnspecifiedError,
            message: 'An unspecified error has occurred'
          };
      }

      res.status(err.status || 500);
      res.json(errObj);
    }
  }

  // Initialises the xBrowserSync api service
  private async init(): Promise<void> {
    try {
      this.configureServer();
      await this.connectToDb();
      this.prepareDataServices();
      this.prepareRoutes();
      this.app.use(this.handleErrors);
      await this.startService();
    }
    catch (err) {
      this.log(LogLevel.Error, `${this.config.apiName} failed to start`, null, err);
      process.exit(1);
    }
  }

  // 
  @autobind
  private log(level: LogLevel, message: string, req?: express.Request, err?: Error): void {
    switch (level) {
      case LogLevel.Error:
        if (this.config.log.enabled) {
          this.logger.error({ req, err }, message);
        }
        console.error(err ? `${message}: ${err.message}` : message);
        break;
      case LogLevel.Info:
        if (this.config.log.enabled) {
          this.logger.info({ req }, message);
        }
        console.log(message);
        break;
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
      const err: any = new Error();
      err.name = ApiError.NotImplementedError;
      err.status = 404;
      next(err);
    });
  }
}

export default new API();