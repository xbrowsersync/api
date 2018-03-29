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
const api_1 = require("./api");
// 
class BaseRouter {
    constructor(service) {
        this.routesVersioning = require('express-routes-versioning')();
        this.service = service;
        // Configure routes
        this.router = express_1.Router();
        this.initRoutes();
    }
    //
    createRoute(verb, path, version, routeMethod) {
        const options = {};
        options[version] = routeMethod;
        this.router[verb](path, this.routesVersioning(options, this.unsupportedVersion));
    }
    // 
    initRoutes() {
        const err = new Error();
        err.name = api_1.ApiError.NotImplementedError;
        throw err;
    }
    // 
    unsupportedVersion(req, res, next) {
        const err = new Error();
        err.name = api_1.ApiError.UnsupportedVersionError;
        throw err;
    }
}
__decorate([
    core_decorators_1.autobind
], BaseRouter.prototype, "createRoute", null);
exports.default = BaseRouter;
//# sourceMappingURL=baseRouter.js.map