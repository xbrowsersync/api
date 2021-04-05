"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
// Base class for data service implementations
// Implements the functionality executed when calling a route
class ApiService {
    constructor(service, log) {
        this.service = service;
        this.log = log;
    }
}
exports.ApiService = ApiService;
