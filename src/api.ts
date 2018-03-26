import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as bunyan from 'bunyan';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import DB from './db';
import InfoRouter from './infoRouter';
import InfoService from './infoService';
import BookmarksRouter from './bookmarksRouter';
import BookmarksService from './bookmarksService';

// Starts a new instance of the xBrowserSync api
class API {
  private config = require('./config.json');
  private db: DB;
  private logger: bunyan;
  private express: express.Application;

  constructor() {
    this.init();
  }

  // Initialises the xBrowserSync api service
  private async init(): Promise<void> {
    try {
      // Initialise the express server
      this.express = express();
      this.initMiddleware();
      this.initRoutes();

      // Connect to db
      this.db = new DB(this.logger);
      await this.db.connect();

      // Start the api service
      this.start();
    }
    catch (err) {
      process.exit(1);
    }
  }

  // Configures api middleware
  private initMiddleware(): void {
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

    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  // Configures api routing
  private initRoutes(): void {
    const router = express.Router();
    this.express.use('/', router);
    
    // Configure bookmarks routing
    const bookmarksService = new BookmarksService(this.logger);
    const bookmarksRouter = new BookmarksRouter(bookmarksService);
    this.express.use('/bookmarks', bookmarksRouter.router);

    // Configure info routing
    const infoService = new InfoService(bookmarksService, this.logger);
    const infoRouter = new InfoRouter(infoService);
    this.express.use('/info', infoRouter.router);
  }

  // Starts the api service
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(this.express);
      server.listen(this.config.server.port);

      server.on('close', conn => {
        this.logger.info(`${this.config.apiName} terminating.`);
      });

      server.on('error', (err: NodeJS.ErrnoException) => {
        this.logger.error({ err: err }, `Uncaught exception occurred in ${this.config.apiName}.`);
        server.close();
      });

      server.on('listening', conn => {
        this.logger.info(`${this.config.apiName} started on ${this.config.server.host}:${this.config.server.port}`);
        resolve();
      });
    });
  }
}

export default new API();