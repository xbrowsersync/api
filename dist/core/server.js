"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan = require("bunyan");
var core_decorators_1 = require("core-decorators");
var cors = require("cors");
var express = require("express");
var fs = require("fs");
var helmet = require("helmet");
var http = require("http");
var https = require("https");
var mkdirp = require("mkdirp");
var config_1 = require("../core/config");
var db_1 = require("../core/db");
var exception_1 = require("../core/exception");
var bookmarks_router_1 = require("../routers/bookmarks.router");
var docs_router_1 = require("../routers/docs.router");
var info_router_1 = require("../routers/info.router");
var bookmarks_service_1 = require("../services/bookmarks.service");
var info_service_1 = require("../services/info.service");
var newSyncLogs_service_1 = require("../services/newSyncLogs.service");
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
var Server = /** @class */ (function () {
    function Server() {
        this.rateLimit = require('express-rate-limit');
    }
    // Throws an error if the service status is set to offline in config
    Server.checkServiceAvailability = function () {
        if (!config_1.default.get().status.online) {
            throw new exception_1.ServiceNotAvailableException();
        }
    };
    Object.defineProperty(Server.prototype, "Application", {
        get: function () {
            return this.app;
        },
        enumerable: true,
        configurable: true
    });
    // Initialises the xBrowserSync api service when a new instance is created
    Server.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.configureServer();
                        this.prepareDataServices();
                        this.prepareRoutes();
                        this.app.use(this.handleErrors);
                        // Establish database connection
                        return [4 /*yield*/, this.connectToDb()];
                    case 1:
                        // Establish database connection
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        this.log(LogLevel.Error, "Service failed to start", null, err_1);
                        process.exit(1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Logs messages and errors to console and to file (if enabled)
    Server.prototype.log = function (level, message, req, err) {
        if (!this.logger) {
            return;
        }
        switch (level) {
            case LogLevel.Error:
                this.logger.error({ req: req, err: err }, message);
                break;
            case LogLevel.Info:
                this.logger.info({ req: req }, message);
                break;
        }
    };
    // Starts the api service
    Server.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Create https server if enabled in config, otherwise create http server
                        if (config_1.default.get().server.https.enabled) {
                            options = {
                                cert: fs.readFileSync(config_1.default.get().server.https.certPath),
                                key: fs.readFileSync(config_1.default.get().server.https.keyPath)
                            };
                            this.server = https.createServer(options, this.app);
                        }
                        else {
                            this.server = http.createServer(this.app);
                        }
                        this.server.listen(config_1.default.get().server.port);
                        // Wait for server to start before continuing
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.server.on('error', function (err) {
                                    _this.log(LogLevel.Error, "Uncaught exception occurred", null, err);
                                    _this.server.close(function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, this.cleanupServer()];
                                                case 1:
                                                    _a.sent();
                                                    process.exit(1);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                });
                                _this.server.on('listening', function (conn) {
                                    _this.log(LogLevel.Info, "Service started on " + config_1.default.get().server.host + ":" + config_1.default.get().server.port);
                                    resolve();
                                });
                            })];
                    case 1:
                        // Wait for server to start before continuing
                        _a.sent();
                        // Catches ctrl+c event
                        process.on('SIGINT', function () {
                            _this.log(LogLevel.Info, "Process terminated by SIGINT", null, null);
                            _this.server.close(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.cleanupServer()];
                                        case 1:
                                            _a.sent();
                                            process.exit(0);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        });
                        // Catches kill pid event
                        process.on('SIGUSR1', function () {
                            _this.log(LogLevel.Info, "Process terminated by SIGUSR1", null, null);
                            _this.server.close(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.cleanupServer()];
                                        case 1:
                                            _a.sent();
                                            process.exit(0);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        });
                        // Catches kill pid event
                        process.on('SIGUSR2', function () {
                            _this.log(LogLevel.Info, "Process terminated by SIGUSR2", null, null);
                            _this.server.close(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.cleanupServer()];
                                        case 1:
                                            _a.sent();
                                            process.exit(0);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    // Stops the api service
    Server.prototype.stop = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.server.close(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.cleanupServer()];
                        case 1:
                            _a.sent();
                            resolve();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    // Cleans up server connections when stopping the service
    Server.prototype.cleanupServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log(LogLevel.Info, "Service shutting down");
                        return [4 /*yield*/, this.db.closeConnection()];
                    case 1:
                        _a.sent();
                        this.server.removeAllListeners();
                        process.removeAllListeners();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Initialises the express application and middleware
    Server.prototype.configureServer = function () {
        var logStreams = [];
        this.app = express();
        // Enabled logging to stdout if required
        if (config_1.default.get().log.stdout.enabled) {
            // Add file log stream
            logStreams.push({
                level: config_1.default.get().log.stdout.level,
                stream: process.stdout
            });
        }
        // Enable logging to file if required
        if (config_1.default.get().log.file.enabled) {
            try {
                // Ensure log directory exists
                var logDirectory = config_1.default.get().log.file.path.substring(0, config_1.default.get().log.file.path.lastIndexOf('/'));
                if (!fs.existsSync(logDirectory)) {
                    mkdirp.sync(logDirectory);
                }
                // Add file log stream
                logStreams.push({
                    count: config_1.default.get().log.file.rotatedFilesToKeep,
                    level: config_1.default.get().log.file.level,
                    path: config_1.default.get().log.file.path,
                    period: config_1.default.get().log.file.rotationPeriod,
                    type: 'rotating-file'
                });
            }
            catch (err) {
                console.error("Failed to initialise log file.");
                throw err;
            }
        }
        if (logStreams.length > 0) {
            try {
                // Initialise bunyan logger
                this.logger = bunyan.createLogger({
                    name: 'xBrowserSync_api',
                    serializers: bunyan.stdSerializers,
                    streams: logStreams
                });
            }
            catch (err) {
                console.error("Failed to initialise logger.");
                throw err;
            }
        }
        // Create helmet config for security hardening
        var helmetConfig = {
            contentSecurityPolicy: {
                directives: { defaultSrc: ["'self'"] }
            },
            noCache: true,
            referrerPolicy: true
        };
        this.app.use(helmet(helmetConfig));
        // Add default version to request if not supplied
        this.app.use(function (req, res, next) {
            req.version = req.headers['accept-version'] || config_1.default.get().version;
            next();
        });
        // If behind proxy use 'X-Forwarded-For' header for client ip address
        if (config_1.default.get().server.behindProxy) {
            this.app.enable('trust proxy');
        }
        // Process JSON-encoded bodies, set body size limit to config value or default to 500kb
        this.app.use(express.json({
            limit: config_1.default.get().maxSyncSize || 512000
        }));
        // Enable support for CORS
        var corsOptions = config_1.default.get().allowedOrigins.length > 0 && {
            origin: function (origin, callback) {
                if (config_1.default.get().allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                }
                else {
                    var err = new exception_1.OriginNotPermittedException();
                    callback(err);
                }
            }
        };
        this.app.use(cors(corsOptions));
        this.app.options('*', cors(corsOptions));
        // Add thottling if enabled
        if (config_1.default.get().throttle.maxRequests > 0) {
            this.app.use(new this.rateLimit({
                delayMs: 0,
                handler: function (req, res, next) {
                    next(new exception_1.RequestThrottledException());
                },
                max: config_1.default.get().throttle.maxRequests,
                windowMs: config_1.default.get().throttle.timeWindow
            }));
        }
    };
    // Initialises and connects to mongodb
    Server.prototype.connectToDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.db = new db_1.default(this.log);
                        return [4 /*yield*/, this.db.openConnection()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Handles and logs api errors
    Server.prototype.handleErrors = function (err, req, res, next) {
        if (err) {
            var responseObj = void 0;
            // Determine the response value based on the error thrown
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
        }
    };
    // Initialise data services
    Server.prototype.prepareDataServices = function () {
        this.newSyncLogsService = new newSyncLogs_service_1.default(null, this.log);
        this.bookmarksService = new bookmarks_service_1.default(this.newSyncLogsService, this.log);
        this.infoService = new info_service_1.default(this.bookmarksService, this.log);
    };
    // Configures api routing
    Server.prototype.prepareRoutes = function () {
        var router = express.Router();
        this.app.use('/', router);
        // Configure docs routing
        var docsRouter = new docs_router_1.default(this.app);
        // Configure bookmarks routing
        var bookmarksRouter = new bookmarks_router_1.default(this.app, this.bookmarksService);
        // Configure info routing
        var infoRouter = new info_router_1.default(this.app, this.infoService);
        // Handle all other routes with 404 error
        this.app.use(function (req, res, next) {
            var err = new exception_1.NotImplementedException();
            next(err);
        });
    };
    __decorate([
        core_decorators_1.autobind
    ], Server.prototype, "log", null);
    __decorate([
        core_decorators_1.autobind
    ], Server.prototype, "start", null);
    return Server;
}());
exports.default = Server;
//# sourceMappingURL=server.js.map