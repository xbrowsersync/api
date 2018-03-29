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
const moment = require("moment");
const api_1 = require("./api");
const baseService_1 = require("./baseService");
const newSyncLogsModel_1 = require("./newSyncLogsModel");
// Handles data interaction for the newsynclogs collection in mongodb
class NewSyncLogsService extends baseService_1.default {
    // Adds a new log entry to the newsynclogs collection based on a given request
    createLog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the client's ip address
            const clientIp = this.getClientIpAddress(req);
            if (!clientIp) {
                if (this.config.log.enabled) {
                    const err = new Error();
                    err.name = api_1.ApiError.ClientIpAddressEmptyError;
                    this.logger.error({ req, err }, 'Exception occurred in NewSyncLogsService.createLog.');
                }
                return;
            }
            // Initialise the document
            const newLog = {
                ipAddress: clientIp,
                syncCreated: new Date()
            };
            const newSyncLogsModel = new newSyncLogsModel_1.default(newLog);
            // Add document to db
            return new Promise((resolve, reject) => {
                newSyncLogsModel.save((err, document) => {
                    if (err) {
                        if (this.config.log.enabled) {
                            this.logger.error({ req, err }, 'Exception occurred in NewSyncLogsService.createLog.');
                        }
                        reject(err);
                    }
                    resolve(document);
                });
            });
        });
    }
    // 
    newSyncsLimitHit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Clear new syncs log of old entries
            yield this.clearLog(req);
            // Get the client's ip address
            const clientIp = this.getClientIpAddress(req);
            if (!clientIp) {
                const err = new Error();
                err.name = api_1.ApiError.ClientIpAddressEmptyError;
                if (this.config.log.enabled) {
                    this.logger.error({ req, err }, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit.');
                }
                throw err;
            }
            // Get number of new syncs created today by this ip
            const newSyncsCreated = yield new Promise((resolve, reject) => {
                newSyncLogsModel_1.default.count({
                    ipAddress: clientIp
                }, (err, count) => {
                    if (err) {
                        if (this.config.log.enabled) {
                            this.logger.error({ req, err }, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit.');
                        }
                        reject(err);
                    }
                    resolve(count);
                });
            });
            // Check returned count against dailyNewSyncsLimit config value
            return newSyncsCreated >= this.config.dailyNewSyncsLimit;
        });
    }
    // Clears all new sync logs older than today
    clearLog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new Promise((resolve, reject) => {
                newSyncLogsModel_1.default.remove({
                    syncCreated: {
                        $lt: moment().startOf('day').toDate()
                    }
                }, err => {
                    if (err) {
                        if (this.config.log.enabled) {
                            this.logger.error({ req, err }, 'Exception occurred in NewSyncLogsService.clearLog.');
                        }
                        reject(err);
                    }
                });
                resolve();
            });
        });
    }
    // Extracts and cleans the client's IP address from a given request
    getClientIpAddress(req) {
        const matches = req.ip.match(/(\d+\.\d+\.\d+\.\d+)/) || [''];
        return matches[0];
    }
}
exports.default = NewSyncLogsService;
//# sourceMappingURL=newSyncLogsService.js.map