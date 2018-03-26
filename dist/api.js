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
const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const bunyan = require("bunyan");
const fs = require("fs");
const mkdirp = require("mkdirp");
const db_1 = require("./db");
const infoRouter_1 = require("./infoRouter");
const infoService_1 = require("./infoService");
const bookmarksRouter_1 = require("./bookmarksRouter");
const bookmarksService_1 = require("./bookmarksService");
// Starts a new instance of the xBrowserSync api
class API {
    constructor() {
        this.config = require('./config.json');
        this.init();
    }
    // Initialises the xBrowserSync api service
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Initialise the express server
                this.express = express();
                this.initMiddleware();
                this.initRoutes();
                // Connect to db
                this.db = new db_1.default(this.logger);
                yield this.db.connect();
                // Start the api service
                this.start();
            }
            catch (err) {
                process.exit(1);
            }
        });
    }
    // Configures api middleware
    initMiddleware() {
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
    initRoutes() {
        const router = express.Router();
        this.express.use('/', router);
        // Configure bookmarks routing
        const bookmarksService = new bookmarksService_1.default(this.logger);
        const bookmarksRouter = new bookmarksRouter_1.default(bookmarksService);
        this.express.use('/bookmarks', bookmarksRouter.router);
        // Configure info routing
        const infoService = new infoService_1.default(bookmarksService, this.logger);
        const infoRouter = new infoRouter_1.default(infoService);
        this.express.use('/info', infoRouter.router);
    }
    // Starts the api service
    start() {
        return new Promise((resolve, reject) => {
            const server = http.createServer(this.express);
            server.listen(this.config.server.port);
            server.on('close', conn => {
                this.logger.info(`${this.config.apiName} terminating.`);
            });
            server.on('error', (err) => {
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
exports.default = new API();
//# sourceMappingURL=api.js.map