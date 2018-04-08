"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("./exception");
const Config = require('./config.json');
// Base class for data service implementations
// Implements the functionality executed when calling a route
class BaseService {
    constructor(service, log) {
        this.service = service;
        this.log = log;
    }
    // Throws an error if the service status is set to offline in config
    checkServiceAvailability() {
        if (!Config.status.online) {
            throw new exception_1.ServiceNotAvailableException();
        }
    }
}
exports.default = BaseService;
//# sourceMappingURL=baseService.js.map