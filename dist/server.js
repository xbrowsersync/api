"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopService = exports.startService = exports.logMessage = exports.initRoutes = exports.initApplication = exports.handleError = exports.createLogger = exports.createApplication = exports.cleanupServer = void 0;
const bunyan_1 = __importDefault(require("bunyan"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const fs_1 = __importDefault(require("fs"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const nocache_1 = __importDefault(require("nocache"));
const enums_1 = require("./common/enums");
const Config = __importStar(require("./config"));
const DB = __importStar(require("./db"));
const exception_1 = require("./exception");
const Location = __importStar(require("./location"));
const bookmarks_router_1 = require("./routers/bookmarks.router");
const docs_router_1 = require("./routers/docs.router");
const info_router_1 = require("./routers/info.router");
const bookmarks_service_1 = require("./services/bookmarks.service");
const info_service_1 = require("./services/info.service");
const newSyncLogs_service_1 = require("./services/newSyncLogs.service");
let logger;
// Cleans up server connections when stopping the service
const cleanupServer = async (server) => {
    exports.logMessage(enums_1.LogLevel.Info, `Service shutting down`);
    await DB.disconnect();
    server.removeAllListeners();
    process.removeAllListeners();
};
exports.cleanupServer = cleanupServer;
// Creates a new express application, configures routes and connects to the database
const createApplication = async () => {
    const app = express_1.default();
    try {
        exports.initApplication(app);
        exports.initRoutes(app);
        app.use(exports.handleError);
        // Establish database connection
        await DB.connect(exports.logMessage);
    }
    catch (err) {
        exports.logMessage(enums_1.LogLevel.Error, `Couldn't create application`, null, err);
        return process.exit(1);
    }
    return app;
};
exports.createApplication = createApplication;
// Creates a new bunyan logger for the module
const createLogger = (logStreams) => {
    try {
        logger = bunyan_1.default.createLogger({
            name: 'xBrowserSync_api',
            serializers: bunyan_1.default.stdSerializers,
            streams: logStreams,
        });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Failed to initialise logger.`);
        throw err;
    }
};
exports.createLogger = createLogger;
// Handles and logs api errors
const handleError = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    // Determine the response value based on the error thrown
    let responseObj;
    switch (true) {
        // If the error is one of our exceptions get the reponse object to return to the client
        case err instanceof exception_1.ApiException:
            responseObj = err.getResponseObject();
            break;
        // If the error is 413 Request Entity Too Large return a SyncDataLimitExceededException
        case err.status === 413:
            err = new exception_1.SyncDataLimitExceededException();
            responseObj = err.getResponseObject();
            break;
        // Otherwise return an UnspecifiedException
        default:
            err = new exception_1.UnspecifiedException();
            responseObj = err.getResponseObject();
    }
    res.status(err.status || 500);
    if (req.accepts('json')) {
        res.json(responseObj);
        return;
    }
    next(responseObj);
};
exports.handleError = handleError;
// Initialises the express application and middleware
const initApplication = (app) => {
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
            if (!fs_1.default.existsSync(logDirectory)) {
                mkdirp_1.default.sync(logDirectory);
            }
            // Add file log stream
            logStreams.push({
                count: Config.get().log.file.rotatedFilesToKeep,
                level: Config.get().log.file.level,
                path: Config.get().log.file.path,
                period: Config.get().log.file.rotationPeriod,
                type: 'rotating-file',
            });
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error(`Failed to initialise log file.`);
            throw err;
        }
    }
    if (logStreams.length > 0) {
        // Initialise bunyan logger
        exports.createLogger(logStreams);
    }
    // Create helmet config for security hardening
    app.use(helmet_1.default());
    app.use(nocache_1.default());
    // Add default version to request if not supplied
    app.use((req, res, next) => {
        req.version = req.headers['accept-version'] || Config.get().version;
        next();
    });
    // If behind proxy use 'X-Forwarded-For' header for client ip address
    if (Config.get().server.behindProxy) {
        app.enable('trust proxy');
    }
    // Process JSON-encoded bodies, set body size limit to config value or default to 500kb
    app.use(express_1.default.json({
        limit: Config.get().maxSyncSize || 512000,
    }));
    // Enable support for CORS
    const corsOptions = Config.get().allowedOrigins.length > 0
        ? {
            origin: (origin, callback) => {
                if (Config.get().allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                }
                else {
                    const err = new exception_1.OriginNotPermittedException();
                    callback(err);
                }
            },
        }
        : undefined;
    app.use(cors_1.default(corsOptions));
    // Add thottling if enabled
    if (Config.get().throttle.maxRequests > 0) {
        app.use(express_rate_limit_1.default({
            handler: (req, res, next) => {
                next(new exception_1.RequestThrottledException());
            },
            max: Config.get().throttle.maxRequests,
            windowMs: Config.get().throttle.timeWindow,
        }));
    }
};
exports.initApplication = initApplication;
// Configures api routing
const initRoutes = (app) => {
    const router = express_1.default.Router();
    app.use(Config.get().server.relativePath, router);
    // Initialise services
    const newSyncLogsService = new newSyncLogs_service_1.NewSyncLogsService(null, exports.logMessage);
    const bookmarksService = new bookmarks_service_1.BookmarksService(newSyncLogsService, exports.logMessage);
    const infoService = new info_service_1.InfoService(bookmarksService, exports.logMessage);
    // Initialise routes
    const docsRouter = new docs_router_1.DocsRouter(app);
    const bookmarkRouter = new bookmarks_router_1.BookmarksRouter(app, bookmarksService);
    const infoRouter = new info_router_1.InfoRouter(app, infoService);
    // Handle all other routes with 404 error
    app.use((req, res, next) => {
        const err = new exception_1.NotImplementedException();
        next(err);
    });
};
exports.initRoutes = initRoutes;
// Logs messages and errors to console and to file (if enabled)
const logMessage = (level, message, req, err) => {
    if (!logger) {
        return;
    }
    switch (level) {
        case enums_1.LogLevel.Error:
            logger.error({ req, err }, message);
            break;
        case enums_1.LogLevel.Info:
        default:
            logger.info({ req }, message);
            break;
    }
};
exports.logMessage = logMessage;
// Starts the api service
const startService = async (app) => {
    // Check if location is valid before starting
    if (!Location.validateLocationCode(Config.get().location)) {
        exports.logMessage(enums_1.LogLevel.Error, `Location is not a valid country code, exiting`);
        return process.exit(1);
    }
    // Create https server if enabled in config, otherwise create http server
    let server;
    const serverListening = () => {
        const protocol = Config.get().server.https.enabled ? 'https' : 'http';
        const url = `${protocol}://${Config.get().server.host}:${Config.get().server.port}${Config.get().server.relativePath}`;
        exports.logMessage(enums_1.LogLevel.Info, `Service started at ${url}`);
    };
    if (Config.get().server.https.enabled) {
        const options = {
            cert: fs_1.default.readFileSync(Config.get().server.https.certPath),
            key: fs_1.default.readFileSync(Config.get().server.https.keyPath),
        };
        server = https_1.default.createServer(options, app).listen(Config.get().server.port, null, serverListening);
    }
    else {
        server = http_1.default.createServer(app).listen(Config.get().server.port, null, serverListening);
    }
    // Catches ctrl+c event
    process.on('SIGINT', () => {
        exports.logMessage(enums_1.LogLevel.Info, `Process terminated by SIGINT`, null, null);
        server.close(async () => {
            await exports.cleanupServer(server);
            return process.exit(0);
        });
    });
    // Catches kill pid event
    process.on('SIGUSR1', () => {
        exports.logMessage(enums_1.LogLevel.Info, `Process terminated by SIGUSR1`, null, null);
        server.close(async () => {
            await exports.cleanupServer(server);
            return process.exit(0);
        });
    });
    // Catches kill pid event
    process.on('SIGUSR2', () => {
        exports.logMessage(enums_1.LogLevel.Info, `Process terminated by SIGUSR2`, null, null);
        server.close(async () => {
            await exports.cleanupServer(server);
            return process.exit(0);
        });
    });
    return server;
};
exports.startService = startService;
// Stops the api service
const stopService = (server) => {
    return new Promise((resolve) => {
        server.close(async () => {
            await exports.cleanupServer(server);
            resolve();
        });
    });
};
exports.stopService = stopService;
