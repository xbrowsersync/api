"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Base class for data service implementations
// Implements the functionality executed when calling a route
class BaseService {
    constructor(service, log) {
        this.service = service;
        this.log = log;
    }
}
exports.default = BaseService;
//# sourceMappingURL=baseService.js.map