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
const exception_1 = require("./exception");
const newSyncLogsModel_1 = require("./newSyncLogsModel");
// Implementation of data service for new sync log operations
class NewSyncLogsService extends baseService_1.default {
    // Creates a new sync log entry with the supplied request data
    createLog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the client's ip address
            const clientIp = this.getClientIpAddress(req);
            if (!clientIp) {
                const err = new exception_1.ClientIpAddressEmptyException();
                this.log(api_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.createLog', req, err);
                throw err;
            }
            // Create new sync log payload
            const newLog = {
                ipAddress: clientIp,
                syncCreated: new Date()
            };
            const newSyncLogsModel = new newSyncLogsModel_1.default(newLog);
            // Commit the payload to the db
            yield new Promise((resolve, reject) => {
                newSyncLogsModel.save((err, document) => {
                    if (err) {
                        this.log(api_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.createLog', req, err);
                        reject(err);
                    }
                    resolve();
                });
            });
        });
    }
    // Returns true/false depending on whether a given request's ip address has hit the limit for daily new syncs created
    newSyncsLimitHit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Clear newsynclogs collection of old entries
            yield this.clearLog(req);
            // Get the client's ip address
            const clientIp = this.getClientIpAddress(req);
            if (!clientIp) {
                const err = new exception_1.ClientIpAddressEmptyException();
                this.log(api_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
                throw err;
            }
            // Query the newsynclogs collection for the total number of logs for the given ip address
            const newSyncsCreated = yield new Promise((resolve, reject) => {
                newSyncLogsModel_1.default.count({
                    ipAddress: clientIp
                }, (err, count) => {
                    if (err) {
                        this.log(api_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
                        reject(err);
                    }
                    resolve(count);
                });
            });
            // Check returned count against config setting
            return newSyncsCreated >= this.config.dailyNewSyncsLimit;
        });
    }
    // Deletes all new sync logs created before today
    clearLog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new Promise((resolve, reject) => {
                newSyncLogsModel_1.default.remove({
                    syncCreated: {
                        $lt: moment().startOf('day').toDate()
                    }
                }, err => {
                    if (err) {
                        this.log(api_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.clearLog', req, err);
                        reject(err);
                    }
                });
                resolve();
            });
        });
    }
    // Extracts and cleans the client's ip address from a given request
    getClientIpAddress(req) {
        const matches = req.ip.match(/(\d+\.\d+\.\d+\.\d+)/) || [''];
        return matches[0];
    }
}
exports.default = NewSyncLogsService;
//# sourceMappingURL=newSyncLogsService.js.map