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
const Config = require('./config.json');
class InfoService {
    constructor(bookmarksService, logger) {
        this.bookmarksService = bookmarksService;
        this.logger = logger;
    }
    // Returns information describing the xBrowserSync service
    getInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create response object
            const serviceInfo = {
                maxSyncSize: Config.maxSyncSize,
                message: Config.status.message,
                status: api_1.ApiStatus.offline,
                version: Config.version
            };
            if (Config.status.online) {
                try {
                    // Check if accepting new syncs
                    const acceptingNewSyncs = yield this.bookmarksService.isAcceptingNewSyncs();
                    serviceInfo.status = acceptingNewSyncs ? api_1.ApiStatus.online : api_1.ApiStatus.noNewSyncs;
                }
                catch (err) {
                    if (Config.log.enabled) {
                        this.logger.error({ req: req, err: err }, 'Exception occurred in InfoService.getInfo.');
                    }
                }
            }
            return serviceInfo;
        });
    }
}
exports.default = InfoService;
//# sourceMappingURL=infoService.js.map