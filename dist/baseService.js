"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const Config = require('./config.json');
// 
class BaseService {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
    }
    // 
    checkServiceAvailability() {
        if (!Config.status.online) {
            const err = new Error();
            err.name = api_1.ApiError.ServiceNotAvailableError;
            throw err;
        }
    }
}
exports.default = BaseService;
//# sourceMappingURL=baseService.js.map