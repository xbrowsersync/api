"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
// 
class BaseService {
    constructor(service, logger) {
        this.config = require('./config.json');
        this.service = service;
        this.logger = logger;
    }
    // 
    checkServiceAvailability() {
        if (!this.config.status.online) {
            const err = new Error();
            err.name = api_1.ApiError.ServiceNotAvailableError;
            throw err;
        }
    }
}
exports.default = BaseService;
//# sourceMappingURL=baseService.js.map