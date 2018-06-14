"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_decorators_1 = require("core-decorators");
const express_1 = require("express");
const exception_1 = require("./exception");
// Base class for router implementations
// Implements the routes that are served by the api 
class BaseRouter {
    constructor(service) {
        this.routesVersioning = require('express-routes-versioning')();
        this.service = service;
        // Configure routes
        this.router = express_1.Router();
        this.initRoutes();
    }
    // Adds a new route to this router implementation
    createRoute(verb, path, versionMappings) {
        this.router[verb](path, this.routesVersioning(versionMappings, this.unsupportedVersion));
    }
    // Initialises the routes for this router implementation
    initRoutes() {
        throw new exception_1.NotImplementedException();
    }
    // Throws an error for when a requested api version is not supported
    unsupportedVersion(req, res, next) {
        throw new exception_1.UnsupportedVersionException();
    }
}
__decorate([
    core_decorators_1.autobind
], BaseRouter.prototype, "createRoute", null);
exports.default = BaseRouter;
//# sourceMappingURL=baseRouter.js.map