"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var config_1 = require("../core/config");
var exception_1 = require("../core/exception");
var server_1 = require("../core/server");
var newSyncLogs_model_1 = require("../models/newSyncLogs.model");
var base_service_1 = require("./base.service");
// Implementation of data service for new sync log operations
var NewSyncLogsService = /** @class */ (function (_super) {
    __extends(NewSyncLogsService, _super);
    function NewSyncLogsService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Creates a new sync log entry with the supplied request data
    NewSyncLogsService.prototype.createLog = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var clientIp, newLogPayload, newSyncLogsModel, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clientIp = this.getClientIpAddress(req);
                        if (!clientIp) {
                            this.log(server_1.LogLevel.Info, 'Unable to determine client IP address');
                            return [2 /*return*/, null];
                        }
                        newLogPayload = {
                            ipAddress: clientIp
                        };
                        newSyncLogsModel = new newSyncLogs_model_1.default(newLogPayload);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, newSyncLogsModel.save()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        this.log(server_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.createLog', req, err_1);
                        throw err_1;
                    case 4: return [2 /*return*/, newLogPayload];
                }
            });
        });
    };
    // Returns true/false depending on whether a given request's ip address has hit the limit for daily new syncs created
    NewSyncLogsService.prototype.newSyncsLimitHit = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var clientIp, newSyncsCreated, err_2, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clientIp = this.getClientIpAddress(req);
                        if (!clientIp) {
                            this.log(server_1.LogLevel.Info, 'Unable to determine client IP address');
                            return [2 /*return*/, null];
                        }
                        newSyncsCreated = -1;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, newSyncLogs_model_1.default.countDocuments({ ipAddress: clientIp }).exec()];
                    case 2:
                        newSyncsCreated = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        this.log(server_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err_2);
                        throw err_2;
                    case 4:
                        // Ensure a valid count was returned
                        if (newSyncsCreated < 0) {
                            err = new exception_1.UnspecifiedException('New syncs created count cannot be less than zero');
                            this.log(server_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
                            throw err;
                        }
                        // Check returned count against config setting
                        return [2 /*return*/, newSyncsCreated >= config_1.default.get().dailyNewSyncsLimit];
                }
            });
        });
    };
    // Extracts the client's ip address from a given request
    NewSyncLogsService.prototype.getClientIpAddress = function (req) {
        if (!req || !req.ip) {
            return;
        }
        return req.ip;
    };
    return NewSyncLogsService;
}(base_service_1.default));
exports.default = NewSyncLogsService;
//# sourceMappingURL=newSyncLogs.service.js.map