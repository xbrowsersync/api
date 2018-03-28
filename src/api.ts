import * as bunyan from 'bunyan';
import * as cors from 'cors';
import * as express from 'express';
import * as fs from 'fs';
import * as helmet from 'helmet';
import * as http from 'http';
import * as https from 'https';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import DB from './db';
import InfoRouter from './infoRouter';
import InfoService from './infoService';
import BookmarksRouter from './bookmarksRouter';
import BookmarksService from './bookmarksService';
import NewSyncLogsService from './newSyncLogsService';
const RateLimit = require('express-rate-limit');
const Config = require('./config.json');

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

// Starts a new instance of the xBrowserSync api
class API {
  private bookmarksService: BookmarksService;
  private db: DB;
  private logger: bunyan;
  private app: express.Application;
  private infoService: InfoService;
  private newSyncLogsService: NewSyncLogsService;

  constructor() {
    this.init();
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
        name: Config.log.name,
        level: Config.log.level,
        streams: [
          {
            stream: process.stdout,
            level: 'debug'
          },
          {
            path: Config.log.path,
            level: Config.log.level
          }
        ],
        serializers: bunyan.stdSerializers
      });
    }

    // Configure general security using helmet
    // TODO: Add hpkp https://helmetjs.github.io/docs/hpkp/
    this.app.use(helmet({
      noCache: true
    }));

    // Add default version to request if not supplied
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      req['version'] = req.headers['accept-version'] || Config.version;
      next();
    });

    // If behind proxy use 'X-Forwarded-For' header for client ip address
    if (Config.server.behindProxy) {
      this.app.enable('trust proxy');
    }

    // Process JSON-encoded bodies
    this.app.use(express.json({
      limit: Config.maxSyncSize || null
    }));

    // Enable support for CORS
    const corsOptions: cors.CorsOptions =
      Config.server.allowedOrigins.length > 0 && {
        origin: (origin, callback) => {
          if (Config.server.allowedOrigins.indexOf(origin) !== -1) {
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
    this.app.use(new RateLimit({
      windowMs: Config.throttle.timeWindow,
      max: Config.throttle.maxRequests,
      delayMs: 0
    }));
  }

  // Initialises and connects to mongodb
  private async connectToDb(): Promise<void> {
    this.db = new DB(this.logger);
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
      this.startService();
    }
    catch (err) {
      process.exit(1);
    }
  }

  // Initialise data services
  private prepareDataServices(): void {
    this.newSyncLogsService = new NewSyncLogsService(null, this.logger);
    this.bookmarksService = new BookmarksService(this.newSyncLogsService, this.logger);
    this.infoService = new InfoService(this.bookmarksService, this.logger);
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
      var err = new Error();
      err.name = ApiError.NotImplementedError;
      err['status'] = 404;
      next(err);
    });
  }

  // Starts the api service
  public startService(): Promise<void> {
    return new Promise((resolve, reject) => {
      // TODO: Add TLS configuration

      const server = http.createServer(this.app);
      server.listen(Config.server.port);

      server.on('close', conn => {
        if (Config.log.enabled) {
          this.logger.info(`${Config.apiName} terminating.`);
        }
      });

      server.on('error', (err: NodeJS.ErrnoException) => {
        if (Config.log.enabled) {
          this.logger.error({ err: err }, `Uncaught exception occurred in ${Config.apiName}.`);
        }

        server.close();
      });

      server.on('listening', conn => {
        if (Config.log.enabled) {
          this.logger.info(`${Config.apiName} started on ${Config.server.host}:${Config.server.port}`);
        }

        resolve();
      });
    });
  }
}

export default new API();