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
const exception_1 = require("../exception");
const server_1 = require("../server");
const newSyncLogs_model_1 = require("../models/newSyncLogs.model");
const base_service_1 = require("./base.service");
// Implementation of data service for new sync log operations
class NewSyncLogsService extends base_service_1.default {
    // Creates a new sync log entry with the supplied request data
    createLog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the client's ip address
            const clientIp = this.getClientIpAddress(req);
            if (!clientIp) {
                this.log(server_1.LogLevel.Info, 'Unable to determine client IP address');
                return null;
            }
            // Create new sync log payload
            const newLogPayload = {
                ipAddress: clientIp
            };
            const newSyncLogsModel = new newSyncLogs_model_1.default(newLogPayload);
            // Commit the payload to the db
            try {
                yield newSyncLogsModel.save();
            }
            catch (err) {
                this.log(server_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.createLog', req, err);
                throw err;
            }
            return newLogPayload;
        });
    }
    // Returns true/false depending on whether a given request's ip address has hit the limit for daily new syncs created
    newSyncsLimitHit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the client's ip address
            const clientIp = this.getClientIpAddress(req);
            if (!clientIp) {
                this.log(server_1.LogLevel.Info, 'Unable to determine client IP address');
                return null;
            }
            let newSyncsCreated = -1;
            // Query the newsynclogs collection for the total number of logs for the given ip address
            try {
                newSyncsCreated = yield newSyncLogs_model_1.default.countDocuments({ ipAddress: clientIp }).exec();
            }
            catch (err) {
                this.log(server_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
                throw err;
            }
            // Ensure a valid count was returned
            if (newSyncsCreated < 0) {
                const err = new exception_1.UnspecifiedException('New syncs created count cannot be less than zero');
                this.log(server_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
                throw err;
            }
            // Check returned count against config setting
            return newSyncsCreated >= Config.get().dailyNewSyncsLimit;
        });
    }
    // Extracts the client's ip address from a given request
    getClientIpAddress(req) {
        if (!req || !req.ip) {
            return;
        }
        return req.ip;
    }
}
exports.default = NewSyncLogsService;
//# sourceMappingURL=newSyncLogs.service.js.map