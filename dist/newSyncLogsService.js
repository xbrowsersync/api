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
const newSyncLogsModel_1 = require("./newSyncLogsModel");
const baseService_1 = require("./baseService");
const Const = require('./config.json');
// Handles data interaction for the newsynclogs collection in mongodb
class NewSyncLogsService extends baseService_1.default {
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
                        if (Const.log.enabled) {
                            this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.clearLog.');
                        }
                        reject(err);
                    }
                });
                resolve();
            });
        });
    }
    // Adds a new log entry to the newsynclogs collection based on a given request
    createLog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the client's ip address
            const clientIp = this.getClientIpAddress(req);
            if (!clientIp) {
                if (Const.log.enabled) {
                    const err = new Error();
                    err.name = api_1.ApiError.ClientIpAddressEmptyError;
                    this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.createLog.');
                }
                return;
            }
            // Initialise the document
            const createLog = new newSyncLogsModel_1.default({
                ipAddress: clientIp,
                syncCreated: new Date()
            });
            // Add document to db
            const newLog = yield new Promise((resolve, reject) => {
                createLog.save((err, document) => {
                    if (err) {
                        if (Const.log.enabled) {
                            this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.createLog.');
                        }
                        reject(err);
                    }
                    resolve(document);
                });
            });
            return newLog;
        });
    }
    // Extracts and cleans the client's IP address from a given request
    getClientIpAddress(req) {
        const matches = req.ip.match(/(\d+\.\d+\.\d+\.\d+)/) || [''];
        return matches[0];
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
                if (Const.log.enabled) {
                    this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit.');
                }
                throw err;
            }
            // Get number of new syncs created today by this ip
            const newSyncsCreated = yield new Promise((resolve, reject) => {
                newSyncLogsModel_1.default.count({
                    ipAddress: clientIp
                }, (err, count) => {
                    if (err) {
                        if (Const.log.enabled) {
                            this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit.');
                        }
                        reject(err);
                    }
                    resolve(count);
                });
            });
            // Check returned count against dailyNewSyncsLimit config value
            return newSyncsCreated >= Const.dailyNewSyncsLimit;
        });
    }
}
exports.default = NewSyncLogsService;
//# sourceMappingURL=newSyncLogsService.js.map