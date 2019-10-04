"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var base_router_1 = require("../routers/base.router");
// Implementation of routes for API documentation
var DocsRouter = /** @class */ (function (_super) {
    __extends(DocsRouter, _super);
    function DocsRouter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Initialises the routes for this router implementation
    DocsRouter.prototype.initRoutes = function () {
        this.app.use('/', express.static(path.join(__dirname, '../docs')));
    };
    return DocsRouter;
}(base_router_1.default));
exports.default = DocsRouter;
//# sourceMappingURL=docs.router.js.map