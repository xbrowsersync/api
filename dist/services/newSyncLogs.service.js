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
exports.NewSyncLogsService = void 0;
const enums_1 = require("../common/enums");
const Config = __importStar(require("../config"));
const exception_1 = require("../exception");
const newSyncLogs_model_1 = require("../models/newSyncLogs.model");
const api_service_1 = require("./api.service");
// Implementation of data service for new sync log operations
class NewSyncLogsService extends api_service_1.ApiService {
    // Creates a new sync log entry with the supplied request data
    async createLog(req) {
        // Get the client's ip address
        const clientIp = this.getClientIpAddress(req);
        if (!clientIp) {
            this.log(enums_1.LogLevel.Info, 'Unable to determine client IP address');
            return null;
        }
        // Create new sync log payload
        const newLogPayload = {
            ipAddress: clientIp,
        };
        const newSyncLogsModel = new newSyncLogs_model_1.NewSyncLogsModel(newLogPayload);
        // Commit the payload to the db
        try {
            await newSyncLogsModel.save();
        }
        catch (err) {
            this.log(enums_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.createLog', req, err);
            throw err;
        }
        return newLogPayload;
    }
    // Returns true/false depending on whether a given request's ip address has hit the limit for daily new syncs created
    async newSyncsLimitHit(req) {
        // Get the client's ip address
        const clientIp = this.getClientIpAddress(req);
        if (!clientIp) {
            this.log(enums_1.LogLevel.Info, 'Unable to determine client IP address');
            return null;
        }
        let newSyncsCreated = -1;
        // Query the newsynclogs collection for the total number of logs for the given ip address
        try {
            newSyncsCreated = await newSyncLogs_model_1.NewSyncLogsModel.countDocuments({ ipAddress: clientIp }).exec();
        }
        catch (err) {
            this.log(enums_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
            throw err;
        }
        // Ensure a valid count was returned
        if (newSyncsCreated < 0) {
            const err = new exception_1.UnspecifiedException('New syncs created count cannot be less than zero');
            this.log(enums_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
            throw err;
        }
        // Check returned count against config setting
        return newSyncsCreated >= Config.get().dailyNewSyncsLimit;
    }
    // Extracts the client's ip address from a given request
    getClientIpAddress(req) {
        if (!req || !req.ip) {
            return null;
        }
        return req.ip;
    }
}
exports.NewSyncLogsService = NewSyncLogsService;
