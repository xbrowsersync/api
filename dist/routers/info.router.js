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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoRouter = void 0;
const core_decorators_1 = require("core-decorators");
const enums_1 = require("../common/enums");
const Config = __importStar(require("../config"));
const api_router_1 = require("./api.router");
// Implementation of routes for service info operations
class InfoRouter extends api_router_1.ApiRouter {
    // Initialises the routes for this router implementation
    initRoutes() {
        this.app.use(`${Config.get().server.relativePath}info`, this._router);
        this.createRoute(enums_1.Verb.get, '/', { '^1.0.0': this.getInfo });
    }
    // Gets service info such as status, version, etc
    async getInfo(req, res, next) {
        try {
            // Call service method to get service info and return response as json
            const serviceInfo = await this.service.getInfo(req);
            res.send(serviceInfo);
        }
        catch (err) {
            next(err);
        }
    }
}
__decorate([
    core_decorators_1.autobind
], InfoRouter.prototype, "getInfo", null);
exports.InfoRouter = InfoRouter;
