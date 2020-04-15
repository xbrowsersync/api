"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const Config = require("../config");
const base_router_1 = require("../routers/base.router");
// Implementation of routes for API documentation
class DocsRouter extends base_router_1.default {
    // Initialises the routes for this router implementation
    initRoutes() {
        this.app.use(Config.getConfig().server.relativePath, express.static(path.join(__dirname, '../docs')));
    }
}
exports.default = DocsRouter;
//# sourceMappingURL=docs.router.js.map