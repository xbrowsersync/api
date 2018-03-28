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
const bunyan = require("bunyan");
const cors = require("cors");
const express = require("express");
const fs = require("fs");
const helmet = require("helmet");
const http = require("http");
const mkdirp = require("mkdirp");
const path = require("path");
const db_1 = require("./db");
const infoRouter_1 = require("./infoRouter");
const infoService_1 = require("./infoService");
const bookmarksRouter_1 = require("./bookmarksRouter");
const bookmarksService_1 = require("./bookmarksService");
const newSyncLogsService_1 = require("./newSyncLogsService");
const RateLimit = require('express-rate-limit');
const Config = require('./config.json');
var ApiError;
(function (ApiError) {
    ApiError["BookmarksDataLimitExceededError"] = "BookmarksDataLimitExceededError";
    ApiError["BookmarksDataNotFoundError"] = "BookmarksDataNotFoundError";
    ApiError["ClientIpAddressEmptyError"] = "ClientIpAddressEmptyError";
    ApiError["NewSyncsForbiddenError"] = "NewSyncsForbiddenError";
    ApiError["NewSyncsLimitExceededError"] = "NewSyncsLimitExceededError";
    ApiError["NotImplementedError"] = "NotImplementedError";
    ApiError["OriginNotPermittedError"] = "OriginNotPermittedError";
    ApiError["ServiceNotAvailableError"] = "ServiceNotAvailableError";
    ApiError["SyncIdNotFoundError"] = "SyncIdNotFoundError";
    ApiError["UnspecifiedError"] = "UnspecifiedError";
    ApiError["UnsupportedVersionError"] = "UnsupportedVersionError";
})(ApiError = exports.ApiError || (exports.ApiError = {}));
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
// Starts a new instance of the xBrowserSync api
class API {
    constructor() {
        this.init();
    }
    // Initialises the express application and middleware
    configureServer() {
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
        this.app.use((req, res, next) => {
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
        const corsOptions = Config.server.allowedOrigins.length > 0 && {
            origin: (origin, callback) => {
                if (Config.server.allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                }
                else {
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
    connectToDb() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = new db_1.default(this.logger);
            yield this.db.connect();
        });
    }
    // 
    handleErrors(err, req, res, next) {
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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.configureServer();
                yield this.connectToDb();
                this.prepareDataServices();
                this.prepareRoutes();
                this.app.use(this.handleErrors);
                this.startService();
            }
            catch (err) {
                process.exit(1);
            }
        });
    }
    // Initialise data services
    prepareDataServices() {
        this.newSyncLogsService = new newSyncLogsService_1.default(null, this.logger);
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
    startService() {
        return new Promise((resolve, reject) => {
            // TODO: Add TLS configuration
            const server = http.createServer(this.app);
            server.listen(Config.server.port);
            server.on('close', conn => {
                if (Config.log.enabled) {
                    this.logger.info(`${Config.apiName} terminating.`);
                }
            });
            server.on('error', (err) => {
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
exports.default = new API();
//# sourceMappingURL=api.js.map