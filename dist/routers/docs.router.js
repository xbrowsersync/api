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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsRouter = exports.relativePathToDocs = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const Config = __importStar(require("../config"));
const api_router_1 = require("./api.router");
exports.relativePathToDocs = '../docs';
// Implementation of routes for API documentation
class DocsRouter extends api_router_1.ApiRouter {
    // Initialises the routes for this router implementation
    initRoutes() {
        this.app.get('/favicon.ico', (req, res) => res.status(204));
        this.app.use(Config.get().server.relativePath, express_1.default.static(path_1.default.join(__dirname, exports.relativePathToDocs)));
    }
}
exports.DocsRouter = DocsRouter;
