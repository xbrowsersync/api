"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const bunyan = require("bunyan");
const fs = require("fs");
const mkdirp = require("mkdirp");
const cors = require("cors");
const db_1 = require("./db");
const infoRouter_1 = require("./infoRouter");
const infoService_1 = require("./infoService");
const bookmarksRouter_1 = require("./bookmarksRouter");
const bookmarksService_1 = require("./bookmarksService");
const newSyncLogsService_1 = require("./newSyncLogsService");
// Starts a new instance of the xBrowserSync api
class API {
    constructor() {
        this.config = require('./config.json');
        this.init();
    }
    // Initialises the express application and middleware
    configureServer() {
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
        const corsOptions = this.config.server.cors.whitelist.length > 0 && {
            origin: (origin, callback) => {
                if (this.config.server.cors.whitelist.indexOf(origin) !== -1) {
                    callback(null, true);
                }
                else {
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
        this.app.use((err, req, res, next) => {
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
    connectToDb() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = new db_1.default(this.logger);
            yield this.db.connect();
        });
    }
    // Initialises the xBrowserSync api service
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.configureServer();
                yield this.connectToDb();
                this.prepareDataServices();
                this.prepareRoutes();
                this.startService();
            }
            catch (err) {
                process.exit(1);
            }
        });
    }
    // Initialise data services
    prepareDataServices() {
        this.newSyncLogsService = new newSyncLogsService_1.default(this.logger);
        this.bookmarksService = new bookmarksService_1.default(this.newSyncLogsService, this.logger);
        this.infoService = new infoService_1.default(this.bookmarksService, this.logger);
    }
    // Configures api routing
    prepareRoutes() {
        const router = express.Router();
        this.app.use('/', router);
        // Configure bookmarks routing
        const bookmarksRouter = new bookmarksRouter_1.default(this.bookmarksService);
        this.app.use('/bookmarks', bookmarksRouter.router);
        // Configure info routing
        const infoRouter = new infoRouter_1.default(this.infoService);
        this.app.use('/info', infoRouter.router);
    }
    // Starts the api service
    startService() {
        return new Promise((resolve, reject) => {
            const server = http.createServer(this.app);
            server.listen(this.config.server.port);
            server.on('close', conn => {
                if (this.config.log.enabled) {
                    this.logger.info(`${this.config.apiName} terminating.`);
                }
            });
            server.on('error', (err) => {
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
exports.default = new API();
//# sourceMappingURL=api.js.map