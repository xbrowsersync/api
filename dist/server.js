"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan = require("bunyan");
const core_decorators_1 = require("core-decorators");
const cors = require("cors");
const express = require("express");
const fs = require("fs");
const helmet = require("helmet");
const http = require("http");
const https = require("https");
const mkdirp = require("mkdirp");
const path = require("path");
const bookmarksRouter_1 = require("./bookmarksRouter");
const bookmarksService_1 = require("./bookmarksService");
const db_1 = require("./db");
const exception_1 = require("./exception");
const infoRouter_1 = require("./infoRouter");
const infoService_1 = require("./infoService");
const newSyncLogsService_1 = require("./newSyncLogsService");
var ApiStatus;
(function (ApiStatus) {
    ApiStatus[ApiStatus["online"] = 1] = "online";
    ApiStatus[ApiStatus["offline"] = 2] = "offline";
    ApiStatus[ApiStatus["noNewSyncs"] = 3] = "noNewSyncs";
})(ApiStatus = exports.ApiStatus || (exports.ApiStatus = {}));
var ApiVerb;
(function (ApiVerb) {
    ApiVerb["delete"] = "delete";
    ApiVerb["get"] = "get";
    ApiVerb["options"] = "options";
    ApiVerb["patch"] = "patch";
    ApiVerb["post"] = "post";
    ApiVerb["put"] = "put";
})(ApiVerb = exports.ApiVerb || (exports.ApiVerb = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Error"] = 0] = "Error";
    LogLevel[LogLevel["Info"] = 1] = "Info";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
// Main class for the xBrowserSync api service
class Server {
    constructor() {
        this.rateLimit = require('express-rate-limit');
        this.config = require('./config.json');
        this.init();
    }
    // Starts a new instance of the api service
    start() {
        return new Promise((resolve, reject) => {
            let server;
            // Create https server if enabled in config, otherwise create http server
            if (this.config.server.https.enabled) {
                const options = {
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
                this.log(LogLevel.Error, `Service terminating.`);
            });
            server.on('error', (err) => {
                this.log(LogLevel.Error, `Uncaught exception occurred`, null, err);
                server.close();
            });
            server.on('listening', conn => {
                this.log(LogLevel.Info, `Service started on ${this.config.server.host}:${this.config.server.port}`);
                resolve();
            });
        });
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
        const helmetConfig = {
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
        this.app.use((req, res, next) => {
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
        const corsOptions = this.config.allowedOrigins.length > 0 && {
            origin: (origin, callback) => {
                if (this.config.allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                }
                else {
                    const err = new exception_1.OriginNotPermittedException();
                    callback(err);
                }
            }
        };
        this.app.use(cors(corsOptions));
        this.app.options('*', cors(corsOptions));
        // Add thottling if enabled
        if (this.config.throttle.maxRequests > 0) {
            this.app.use(new this.rateLimit({
                delayMs: 0,
                max: this.config.throttle.maxRequests,
                windowMs: this.config.throttle.timeWindow
            }));
        }
    }
    // Initialises and connects to mongodb
    connectToDb() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = new db_1.default(this.log);
            yield this.db.connect();
        });
    }
    // Handles and logs api errors
    handleErrors(err, req, res, next) {
        if (err) {
            let responseObj;
            // If the error is one of our exception, get the reponse object to return to the client
            // otherwise create a new unspecified exception and use that 
            if (err instanceof exception_1.ExceptionBase) {
                responseObj = err.getResponseObject();
            }
            else {
                err = new exception_1.UnspecifiedException();
                responseObj = err.getResponseObject();
            }
            res.status(err.status || 500);
            res.json(responseObj);
        }
    }
    // Initialises the xBrowserSync api service when a new instance is created
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.configureServer();
                yield this.connectToDb();
                this.prepareDataServices();
                this.prepareRoutes();
                this.app.use(this.handleErrors);
                yield this.start();
            }
            catch (err) {
                this.log(LogLevel.Error, `Service failed to start`, null, err);
                process.exit(1);
            }
        });
    }
    // Logs messages and errors to console and to file (if enabled)
    log(level, message, req, err) {
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
    prepareDataServices() {
        this.newSyncLogsService = new newSyncLogsService_1.default(null, this.log);
        this.bookmarksService = new bookmarksService_1.default(this.newSyncLogsService, this.log);
        this.infoService = new infoService_1.default(this.bookmarksService, this.log);
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
        // Configure static route for documentation
        this.app.use('/', express.static(path.join(__dirname, 'docs')));
        // Handle all other routes with 404 error
        this.app.use((req, res, next) => {
            const err = new exception_1.NotImplementedException();
            next(err);
        });
    }
}
__decorate([
    core_decorators_1.autobind
], Server.prototype, "log", null);
exports.default = Server;
//# sourceMappingURL=server.js.map