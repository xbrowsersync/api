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
const baseService_1 = require("./baseService");
const config_1 = require("./config");
const server_1 = require("./server");
// Implementation of data service for service info operations
class InfoService extends baseService_1.default {
    // Returns information describing the xBrowserSync service
    getInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create response object from config settings
            const serviceInfo = {
                maxSyncSize: config_1.default.get().maxSyncSize,
                message: config_1.default.get().status.message,
                status: server_1.ApiStatus.offline,
                version: config_1.default.get().version
            };
            if (config_1.default.get().status.online) {
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
}
exports.default = InfoService;
//# sourceMappingURL=infoService.js.map