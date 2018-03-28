"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_decorators_1 = require("core-decorators");
const api_1 = require("./api");
const baseRouter_1 = require("./baseRouter");
// 
class BookmarksRouter extends baseRouter_1.default {
    // 
    initRoutes() {
        this.createRoute(api_1.ApiVerb.post, '/', '^1.0.0', this.createBookmarks);
        this.createRoute(api_1.ApiVerb.get, '/:id', '^1.0.0', this.getBookmarks);
        this.createRoute(api_1.ApiVerb.put, '/:id', '^1.0.0', this.updateBookmarks);
        this.createRoute(api_1.ApiVerb.get, '/:id/lastUpdated', '^1.0.0', this.getLastUpdated);
    }
    // 
    createBookmarks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newBookmarksSync = yield this.service.createBookmarks(req);
                res.json(newBookmarksSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // 
    getBookmarks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookmarksSync = yield this.service.getBookmarks(req);
                res.json(bookmarksSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // 
    getLastUpdated(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookmarksSync = yield this.service.getLastUpdated(req);
                res.json(bookmarksSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // 
    updateBookmarks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookmarksSync = yield this.service.updateBookmarks(req);
                res.json(bookmarksSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "createBookmarks", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "getBookmarks", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "getLastUpdated", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "updateBookmarks", null);
exports.default = BookmarksRouter;
//# sourceMappingURL=bookmarksRouter.js.map