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
const db_1 = require("../core/db");
const exception_1 = require("../core/exception");
const server_1 = require("../core/server");
const base_router_1 = require("../routers/base.router");
// Implementation of routes for bookmarks operations
class BookmarksRouter extends base_router_1.default {
    // Initialises the routes for this router implementation
    initRoutes() {
        this.app.use('/bookmarks', this.router);
        this.createRoute(server_1.ApiVerb.post, '/', {
            '~1.0.0': this.createBookmarks_v1,
            '~1.1.3': this.createBookmarks_v2
        });
        this.createRoute(server_1.ApiVerb.get, '/:id', { '^1.0.0': this.getBookmarks });
        this.createRoute(server_1.ApiVerb.put, '/:id', {
            '~1.0.0': this.updateBookmarks_v1,
            '~1.1.3': this.updateBookmarks_v2
        });
        this.createRoute(server_1.ApiVerb.get, '/:id/lastUpdated', { '^1.0.0': this.getLastUpdated });
        this.createRoute(server_1.ApiVerb.get, '/:id/version', { '~1.1.3': this.getVersion });
    }
    // Creates a new bookmarks sync and returns new sync ID
    createBookmarks_v1(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get posted bookmarks data
                const bookmarksData = this.getBookmarksData(req);
                if (bookmarksData === '') {
                    throw new exception_1.RequiredDataNotFoundException;
                }
                // Call service method to create new bookmarks sync and return response as json
                const newSync = yield this.service.createBookmarks_v1(bookmarksData, req);
                res.json(newSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Creates an empty sync using sync version and returns new sync ID
    createBookmarks_v2(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get posted sync version
                const syncVersion = req.body.version;
                if (!syncVersion) {
                    throw new exception_1.RequiredDataNotFoundException;
                }
                // Call service method to create new sync and return response as json
                const newSync = yield this.service.createBookmarks_v2(req.body.version, req);
                res.json(newSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Retrieves an existing sync with a provided sync ID
    getBookmarks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check sync id has been provided
                const id = this.getSyncId(req);
                // Call service method to retrieve bookmarks data and return response as json
                const bookmarks = yield this.service.getBookmarks(id, req);
                res.json(bookmarks);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Retrieves posted bookmarks data from request body
    getBookmarksData(req) {
        return req.body.bookmarks || '';
    }
    // Retrieves last updated date for a given sync ID
    getLastUpdated(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check sync id has been provided
                const id = this.getSyncId(req);
                // Call service method to get bookmarks last updated date and return response as json
                const lastUpdated = yield this.service.getLastUpdated(id, req);
                res.json(lastUpdated);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Retrieves the sync ID from the request query string parameters
    getSyncId(req) {
        const id = req.params.id;
        // Check id is valid
        db_1.default.idIsValid(id);
        return id;
    }
    // Retrieves sync version for a given sync ID
    getVersion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check sync id has been provided
                const id = this.getSyncId(req);
                // Call service method to get sync version and return response as json
                const syncVersion = yield this.service.getVersion(id, req);
                res.json(syncVersion);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Updates bookmarks data for a given bookmarks sync ID
    updateBookmarks_v1(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check sync id has been provided
                const id = this.getSyncId(req);
                // Get posted bookmarks data
                const bookmarksData = this.getBookmarksData(req);
                if (bookmarksData === '') {
                    throw new exception_1.RequiredDataNotFoundException;
                }
                // Call service method to update bookmarks data and return response as json
                const bookmarksSync = yield this.service.updateBookmarks_v1(id, bookmarksData, req);
                res.json(bookmarksSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Updates bookmarks sync bookmarks data and sync version for a given bookmarks sync ID
    updateBookmarks_v2(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check sync id has been provided
                const id = this.getSyncId(req);
                // Get posted bookmarks data
                const bookmarksData = this.getBookmarksData(req);
                if (bookmarksData === '') {
                    throw new exception_1.RequiredDataNotFoundException;
                }
                // Call service method to update bookmarks data and return response as json
                const bookmarksSync = yield this.service.updateBookmarks_v2(id, bookmarksData, req.body.version, req);
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
], BookmarksRouter.prototype, "createBookmarks_v1", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "createBookmarks_v2", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "getBookmarks", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "getLastUpdated", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "getVersion", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "updateBookmarks_v1", null);
__decorate([
    core_decorators_1.autobind
], BookmarksRouter.prototype, "updateBookmarks_v2", null);
exports.default = BookmarksRouter;
//# sourceMappingURL=bookmarks.router.js.map