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
const Config = require("../config");
const server_1 = require("../server");
const base_service_1 = require("./base.service");
// Implementation of data service for service info operations
class InfoService extends base_service_1.default {
    // Returns information describing the xBrowserSync service
    getInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert location code to uppercase if set
            const location = Config.get().location && Config.get().location.toUpperCase();
            // Create response object from config settings
            const serviceInfo = {
                location,
                maxSyncSize: Config.get().maxSyncSize,
                message: this.stripScriptsFromHtml(Config.get().status.message),
                status: server_1.ApiStatus.offline,
                version: Config.get().version
            };
            if (Config.get().status.online) {
                try {
                    // Call service method to check if accepting new syncs
                    const acceptingNewSyncs = yield this.service.isAcceptingNewSyncs();
                    serviceInfo.status = acceptingNewSyncs ? server_1.ApiStatus.online : server_1.ApiStatus.noNewSyncs;
                }
                catch (err) {
                    this.log(server_1.LogLevel.Error, 'Exception occurred in InfoService.getInfo', req, err);
                }
            }
            return serviceInfo;
        });
    }
    // Removes script tags from a given HTML string
    stripScriptsFromHtml(html) {
        return !html ? '' : html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
}
exports.default = InfoService;
//# sourceMappingURL=info.service.js.map