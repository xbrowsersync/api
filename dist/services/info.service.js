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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoService = void 0;
const enums_1 = require("../common/enums");
const Config = __importStar(require("../config"));
const api_service_1 = require("./api.service");
// Implementation of data service for service info operations
class InfoService extends api_service_1.ApiService {
    // Returns information describing the xBrowserSync service
    async getInfo(req) {
        // Convert location code to uppercase if set
        const location = Config.get().location && Config.get().location.toUpperCase();
        // Create response object from config settings
        const serviceInfo = {
            location,
            maxSyncSize: Config.get().maxSyncSize,
            message: this.stripScriptsFromHtml(Config.get().status.message),
            status: enums_1.ServiceStatus.offline,
            version: Config.get().version,
        };
        if (Config.get().status.online) {
            try {
                // Call service method to check if accepting new syncs
                const acceptingNewSyncs = await this.service.isAcceptingNewSyncs();
                serviceInfo.status = acceptingNewSyncs ? enums_1.ServiceStatus.online : enums_1.ServiceStatus.noNewSyncs;
            }
            catch (err) {
                this.log(enums_1.LogLevel.Error, 'Exception occurred in InfoService.getInfo', req, err);
            }
        }
        return serviceInfo;
    }
    // Removes script tags from a given HTML string
    stripScriptsFromHtml(html) {
        return !html ? '' : html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
}
exports.InfoService = InfoService;
