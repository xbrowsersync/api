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
const api_1 = require("./api");
const baseService_1 = require("./baseService");
class InfoService extends baseService_1.default {
    // Returns information describing the xBrowserSync service
    getInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create response object
            const serviceInfo = {
                maxSyncSize: this.config.maxSyncSize,
                message: this.config.status.message,
                status: api_1.ApiStatus.offline,
                version: this.config.version
            };
            if (this.config.status.online) {
                try {
                    // Check if accepting new syncs
                    const acceptingNewSyncs = yield this.service.isAcceptingNewSyncs();
                    serviceInfo.status = acceptingNewSyncs ? api_1.ApiStatus.online : api_1.ApiStatus.noNewSyncs;
                }
                catch (err) {
                    this.log(api_1.LogLevel.Error, 'Exception occurred in InfoService.getInfo', req, err);
                }
            }
            return serviceInfo;
        });
    }
}
exports.default = InfoService;
//# sourceMappingURL=infoService.js.map