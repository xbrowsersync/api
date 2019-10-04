"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_decorators_1 = require("core-decorators");
var express_1 = require("express");
var exception_1 = require("../core/exception");
// Base class for router implementations
// Implements the routes that are served by the api 
var BaseRouter = /** @class */ (function () {
    function BaseRouter(app, service) {
        this.app = app;
        this.service = service;
        this.routesVersioning = require('express-routes-versioning')();
        // Configure routes
        this.router = express_1.Router();
        this.initRoutes();
    }
    // Initialises the routes for this router implementation
    BaseRouter.prototype.initRoutes = function () {
        throw new exception_1.NotImplementedException();
    };
    // Adds a new route to this router implementation
    BaseRouter.prototype.createRoute = function (verb, path, versionMappings) {
        this.router[verb](path, this.routesVersioning(versionMappings, this.unsupportedVersion));
    };
    // Throws an error for when a requested api version is not supported
    BaseRouter.prototype.unsupportedVersion = function () {
        throw new exception_1.UnsupportedVersionException();
    };
    __decorate([
        core_decorators_1.autobind
    ], BaseRouter.prototype, "createRoute", null);
    return BaseRouter;
}());
exports.default = BaseRouter;
//# sourceMappingURL=base.router.js.map