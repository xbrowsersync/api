import * as express from 'express';
import * as http from 'http';
import * as bunyan from 'bunyan';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as cors from 'cors';
import DB from './db';
import InfoRouter from './infoRouter';
import InfoService from './infoService';
import BookmarksRouter from './bookmarksRouter';
import BookmarksService from './bookmarksService';
import NewSyncLogsService from './newSyncLogsService';

// Starts a new instance of the xBrowserSync api
class API {
  private bookmarksService: BookmarksService;
  private config = require('./config.json');
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
        name: this.config.log.name,
        level: this.config.log.level,
        streams: [
          {
            stream: process.stdout,
            level: 'debug'
          },
          {
            path: this.config.log.path,
            level: this.config.log.level
          }
        ],
        serializers: bunyan.stdSerializers
      });
    }

    // If behind proxy use 'X-Forwarded-For' header for client ip address
    if (this.config.server.behindProxy) {
      this.app.enable('trust proxy');
    }

    // Process JSON-encoded bodies
    this.app.use(express.json({
      limit: this.config.maxSyncSize || null
    }));

    // Enable support for CORS
    const corsOptions: cors.CorsOptions =
      this.config.server.cors.whitelist.length > 0 && {
        origin: (origin, callback) => {
          if (this.config.server.cors.whitelist.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            const err = new Error('Origin forbidden');
            err.name = 'OriginNotPermittedError';
            callback(err);
          }
        }
      };

    this.app.use(cors(corsOptions));
    this.app.options('*', cors(corsOptions));

    // TODO: Add middleware to generate all api error messages
    // Return friendly error messages
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err) {
        switch (err.name) {
          case 'OriginNotPermittedError':
            return res.json({
              code: 'OriginNotPermittedError',
              message: 'Origin not permitted to access this service'
            });
          case 'PayloadTooLargeError':
            return res.json({
              code: 'PayloadTooLargeError',
              message: 'Request payload exceeded maximum sync size'
            });
          default:
            next();
        }
      }
    });

    // TODO: Add thottling
    /*server.use(restify.throttle({
      rate: config.throttle.rate,
      burst: config.throttle.burst,
      ip: true
    }));*/
  }

  // Initialises and connects to mongodb
  private async connectToDb(): Promise<void> {
    this.db = new DB(this.logger);
    await this.db.connect();
  }

  // Initialises the xBrowserSync api service
  private async init(): Promise<void> {
    try {
      this.configureServer();
      await this.connectToDb();
      this.prepareDataServices();
      this.prepareRoutes();
      this.startService();
    }
    catch (err) {
      process.exit(1);
    }
  }

  // Initialise data services
  private prepareDataServices(): void {
    this.newSyncLogsService = new NewSyncLogsService(this.logger);
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
  }

  // Starts the api service
  public startService(): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(this.app);
      server.listen(this.config.server.port);

      server.on('close', conn => {
        if (this.config.log.enabled) {
          this.logger.info(`${this.config.apiName} terminating.`);
        }
      });

      server.on('error', (err: NodeJS.ErrnoException) => {
        if (this.config.log.enabled) {
          this.logger.error({ err: err }, `Uncaught exception occurred in ${this.config.apiName}.`);
        }

        server.close();
      });

      server.on('listening', conn => {
        if (this.config.log.enabled) {
          this.logger.info(`${this.config.apiName} started on ${this.config.server.host}:${this.config.server.port}`);
        }

        resolve();
      });
    });
  }
}

export default new API();