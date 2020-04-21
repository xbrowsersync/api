"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
const https = require("https");
const mkdirp = require("mkdirp");
const Config = require("./config");
const DB = require("./db");
const exception_1 = require("./exception");
const bookmarks_router_1 = require("./routers/bookmarks.router");
const docs_router_1 = require("./routers/docs.router");
const info_router_1 = require("./routers/info.router");
const bookmarks_service_1 = require("./services/bookmarks.service");
const info_service_1 = require("./services/info.service");
const newSyncLogs_service_1 = require("./services/newSyncLogs.service");
const noCache = require("nocache");
const Location = require("./location");
let logger;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Error"] = 0] = "Error";
    LogLevel[LogLevel["Info"] = 1] = "Info";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus[ServiceStatus["online"] = 1] = "online";
    ServiceStatus[ServiceStatus["offline"] = 2] = "offline";
    ServiceStatus[ServiceStatus["noNewSyncs"] = 3] = "noNewSyncs";
})(ServiceStatus = exports.ServiceStatus || (exports.ServiceStatus = {}));
var Verb;
(function (Verb) {
    Verb["delete"] = "delete";
    Verb["get"] = "get";
    Verb["options"] = "options";
    Verb["patch"] = "patch";
    Verb["post"] = "post";
    Verb["put"] = "put";
})(Verb = exports.Verb || (exports.Verb = {}));
// Throws an error if the service status is set to offline in config
exports.checkServiceAvailability = () => {
    if (!Config.get().status.online) {
        throw new exception_1.ServiceNotAvailableException();
    }
};
// Cleans up server connections when stopping the service
exports.cleanupServer = (server) => __awaiter(void 0, void 0, void 0, function* () {
    exports.logMessage(LogLevel.Info, `Service shutting down`);
    yield DB.disconnect();
    server.removeAllListeners();
    process.removeAllListeners();
});
// Creates a new express application, configures routes and connects to the database
exports.createApplication = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = express();
    try {
        exports.initApplication(app);
        exports.initRoutes(app);
        app.use(exports.handleError);
        // Establish database connection
        yield DB.connect(exports.logMessage);
    }
    catch (err) {
        exports.logMessage(LogLevel.Error, `Couldn't create application`, null, err);
        return process.exit(1);
    }
    return app;
});
// Creates a new bunyan logger for the module
exports.createLogger = (logStreams) => {
    try {
        logger = bunyan.createLogger({
            name: 'xBrowserSync_api',
            serializers: bunyan.stdSerializers,
            streams: logStreams
        });
    }
    catch (err) {
        console.error(`Failed to initialise logger.`);
        throw err;
    }
};
// Handles and logs api errors
exports.handleError = (err, req, res, next) => {
    if (!err) {
        return;
    }
    // Determine the response value based on the error thrown
    let responseObj;
    switch (true) {
        // If the error is one of our exceptions get the reponse object to return to the client
        case err instanceof exception_1.ExceptionBase:
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
    res.json(responseObj);
};
// Initialises the express application and middleware
exports.initApplication = (app) => {
    const logStreams = [];
    // Enabled logging to stdout if required
    if (Config.get().log.stdout.enabled) {
        // Add file log stream
        logStreams.push({
            level: Config.get().log.stdout.level,
            stream: process.stdout
        });
    }
    // Enable logging to file if required
    if (Config.get().log.file.enabled) {
        try {
            // Ensure log directory exists
            const logDirectory = Config.get().log.file.path.substring(0, Config.get().log.file.path.lastIndexOf('/'));
            if (!fs.existsSync(logDirectory)) {
                mkdirp.sync(logDirectory);
            }
            // Add file log stream
            logStreams.push({
                count: Config.get().log.file.rotatedFilesToKeep,
                level: Config.get().log.file.level,
                path: Config.get().log.file.path,
                period: Config.get().log.file.rotationPeriod,
                type: 'rotating-file'
            });
        }
        catch (err) {
            console.error(`Failed to initialise log file.`);
            throw err;
        }
    }
    if (logStreams.length > 0) {
        // Initialise bunyan logger
        exports.createLogger(logStreams);
    }
    // Create helmet config for security hardening
    const helmetConfig = {
        contentSecurityPolicy: {
            directives: { defaultSrc: ["'self'"] }
        },
        referrerPolicy: true
    };
    app.use(helmet(helmetConfig));
    app.use(noCache());
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
    app.use(express.json({
        limit: Config.get().maxSyncSize || 512000
    }));
    // Enable support for CORS
    const corsOptions = Config.get().allowedOrigins.length > 0 ? {
        origin: (origin, callback) => {
            if (Config.get().allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                const err = new exception_1.OriginNotPermittedException();
                callback(err);
            }
        }
    } : undefined;
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
    // Add thottling if enabled
    if (Config.get().throttle.maxRequests > 0) {
        const rateLimit = require('express-rate-limit');
        app.use(new rateLimit({
            delayMs: 0,
            handler: (req, res, next) => {
                next(new exception_1.RequestThrottledException());
            },
            max: Config.get().throttle.maxRequests,
            windowMs: Config.get().throttle.timeWindow
        }));
    }
};
// Configures api routing
exports.initRoutes = (app) => {
    const router = express.Router();
    app.use(Config.get().server.relativePath, router);
    // Initialise services
    const newSyncLogsService = new newSyncLogs_service_1.default(null, exports.logMessage);
    const bookmarksService = new bookmarks_service_1.default(newSyncLogsService, exports.logMessage);
    const infoService = new info_service_1.default(bookmarksService, exports.logMessage);
    // Initialise routes
    new docs_router_1.default(app);
    new bookmarks_router_1.default(app, bookmarksService);
    new info_router_1.default(app, infoService);
    // Handle all other routes with 404 error
    app.use((req, res, next) => {
        const err = new exception_1.NotImplementedException();
        next(err);
    });
};
// Logs messages and errors to console and to file (if enabled)
exports.logMessage = (level, message, req, err) => {
    if (!logger) {
        return;
    }
    switch (level) {
        case LogLevel.Error:
            logger.error({ req, err }, message);
            break;
        case LogLevel.Info:
            logger.info({ req }, message);
            break;
    }
};
// Starts the api service
exports.startService = (app) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if location is valid before starting
    if (!Location.validateLocationCode(Config.get().location)) {
        exports.logMessage(LogLevel.Error, `Location is not a valid country code, exiting`);
        return process.exit(1);
    }
    // Create https server if enabled in config, otherwise create http server
    let server;
    const serverListening = () => {
        const protocol = Config.get().server.https.enabled ? 'https' : 'http';
        const url = `${protocol}://${Config.get().server.host}:${Config.get().server.port}${Config.get().server.relativePath}`;
        exports.logMessage(LogLevel.Info, `Service started at ${url}`);
    };
    if (Config.get().server.https.enabled) {
        const options = {
            cert: fs.readFileSync(Config.get().server.https.certPath),
            key: fs.readFileSync(Config.get().server.https.keyPath)
        };
        server = https.createServer(options, app).listen(Config.get().server.port, null, serverListening);
    }
    else {
        server = http.createServer(app).listen(Config.get().server.port, null, serverListening);
    }
    // Catches ctrl+c event
    process.on('SIGINT', () => {
        exports.logMessage(LogLevel.Info, `Process terminated by SIGINT`, null, null);
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield exports.cleanupServer(server);
            return process.exit(0);
        }));
    });
    // Catches kill pid event
    process.on('SIGUSR1', () => {
        exports.logMessage(LogLevel.Info, `Process terminated by SIGUSR1`, null, null);
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield exports.cleanupServer(server);
            return process.exit(0);
        }));
    });
    // Catches kill pid event
    process.on('SIGUSR2', () => {
        exports.logMessage(LogLevel.Info, `Process terminated by SIGUSR2`, null, null);
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield exports.cleanupServer(server);
            return process.exit(0);
        }));
    });
    return server;
});
// Stops the api service
exports.stopService = (server) => {
    return new Promise(resolve => {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield exports.cleanupServer(server);
            resolve();
        }));
    });
};
//# sourceMappingURL=server.js.map