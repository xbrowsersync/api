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
const constants = require("./constants");
class InfoService {
    constructor(bookmarksService, logger) {
        this.config = require('./config.json');
        this.bookmarksService = bookmarksService;
        this.logger = logger;
    }
    // Returns information describing the xBrowserSync service
    getInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create response object
            const serviceInfo = {
                maxSyncSize: this.config.maxSyncSize,
                message: this.config.status.message,
                status: constants.serviceStatuses.offline,
                version: this.config.version
            };
            if (!this.config.status.offline) {
                try {
                    // Check if accepting new syncs
                    const acceptingNewSyncs = yield this.bookmarksService.isAcceptingNewSyncs();
                    serviceInfo.status = acceptingNewSyncs ? constants.serviceStatuses.online : constants.serviceStatuses.noNewSyncs;
                }
                catch (err) {
                    if (this.config.log.enabled) {
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