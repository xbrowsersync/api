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
var server_1 = require("../core/server");
var base_service_1 = require("./base.service");
// Implementation of data service for service info operations
var InfoService = /** @class */ (function (_super) {
    __extends(InfoService, _super);
    function InfoService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Returns information describing the xBrowserSync service
    InfoService.prototype.getInfo = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceInfo, acceptingNewSyncs, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serviceInfo = {
                            maxSyncSize: config_1.default.get().maxSyncSize,
                            message: this.stripScriptsFromHtml(config_1.default.get().status.message),
                            status: server_1.ApiStatus.offline,
                            version: config_1.default.get().version
                        };
                        if (!config_1.default.get().status.online) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.service.isAcceptingNewSyncs()];
                    case 2:
                        acceptingNewSyncs = _a.sent();
                        serviceInfo.status = acceptingNewSyncs ? server_1.ApiStatus.online : server_1.ApiStatus.noNewSyncs;
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        this.log(server_1.LogLevel.Error, 'Exception occurred in InfoService.getInfo', req, err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, serviceInfo];
                }
            });
        });
    };
    // Removes script tags from a given HTML string
    InfoService.prototype.stripScriptsFromHtml = function (html) {
        return !html ? '' : html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };
    return InfoService;
}(base_service_1.default));
exports.default = InfoService;
//# sourceMappingURL=info.service.js.map