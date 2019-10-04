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
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var config_1 = require("./config");
var exception_1 = require("./exception");
var server_1 = require("./server");
// Handles database interaction
var DB = /** @class */ (function () {
    function DB(log) {
        this.log = log;
    }
    DB.idIsValid = function (id) {
        var binary;
        var base64Str;
        if (!id) {
            throw new exception_1.InvalidSyncIdException();
        }
        try {
            binary = new mongodb.Binary(Buffer.from(id, 'hex'), 4);
            base64Str = binary.buffer.toString('base64');
        }
        catch (err) {
            throw new exception_1.InvalidSyncIdException();
        }
        if (!binary || !base64Str) {
            throw new exception_1.InvalidSyncIdException();
        }
    };
    // Closes the database connection
    DB.prototype.closeConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongoose.disconnect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Initialises the database connection using config settings
    DB.prototype.openConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options, username, password, dbServerUrl, dbConn;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            connectTimeoutMS: config_1.default.get().db.connTimeout,
                            keepAlive: true,
                            useFindAndModify: false,
                            useNewUrlParser: true,
                            useUnifiedTopology: true
                        };
                        username = config_1.default.get().db.username || process.env.XBROWSERSYNC_DB_USER;
                        password = config_1.default.get().db.password || process.env.XBROWSERSYNC_DB_PWD;
                        dbServerUrl = 'mongodb';
                        if (config_1.default.get().db.useSRV) {
                            dbServerUrl += "+srv://" + encodeURIComponent(username) + ":" + encodeURIComponent(password) + "@" + config_1.default.get().db.host + "/" + config_1.default.get().db.name;
                            dbServerUrl += (config_1.default.get().db.authSource) ? "?authSource=" + config_1.default.get().db.authSource : '';
                        }
                        else {
                            dbServerUrl += "://" + encodeURIComponent(username) + ":" + encodeURIComponent(password) + "@" + config_1.default.get().db.host + ":" + config_1.default.get().db.port + "/" + config_1.default.get().db.name + "?authSource=" + config_1.default.get().db.authSource;
                        }
                        mongoose.connect(dbServerUrl, options);
                        dbConn = mongoose.connection;
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                dbConn.on('close', function () {
                                    dbConn.removeAllListeners();
                                });
                                dbConn.on('error', function (err) {
                                    _this.log(server_1.LogLevel.Error, 'Database error', null, err);
                                    reject(new Error('Unable to connect to database.'));
                                });
                                dbConn.once('open', resolve);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DB;
}());
exports.default = DB;
//# sourceMappingURL=db.js.map