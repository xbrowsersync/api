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
exports.BookmarksRouter = void 0;
const core_decorators_1 = require("core-decorators");
const enums_1 = require("../common/enums");
const Config = __importStar(require("../config"));
const exception_1 = require("../exception");
const uuid_1 = require("../uuid");
const api_router_1 = require("./api.router");
// Implementation of routes for bookmarks operations
class BookmarksRouter extends api_router_1.ApiRouter {
    // Initialises the routes for this router implementation
    initRoutes() {
        this.app.use(`${Config.get().server.relativePath}bookmarks`, this._router);
        this.createRoute(enums_1.Verb.post, '/', {
            '~1.0.0': this.createBookmarks_v1,
            // tslint:disable-next-line:object-literal-sort-keys
            '^1.1.3': this.createBookmarks_v2,
        });
        this.createRoute(enums_1.Verb.get, '/:id', { '^1.0.0': this.getBookmarks });
        this.createRoute(enums_1.Verb.put, '/:id', {
            '~1.0.0': this.updateBookmarks_v1,
            // tslint:disable-next-line:object-literal-sort-keys
            '^1.1.3': this.updateBookmarks_v2,
        });
        this.createRoute(enums_1.Verb.get, '/:id/lastUpdated', { '^1.0.0': this.getLastUpdated });
        this.createRoute(enums_1.Verb.get, '/:id/version', { '^1.1.3': this.getVersion });
    }
    // Creates a new bookmarks sync and returns new sync ID
    async createBookmarks_v1(req, res, next) {
        try {
            // Get posted bookmarks data
            const bookmarksData = this.getBookmarksData(req);
            if (bookmarksData === '') {
                throw new exception_1.RequiredDataNotFoundException();
            }
            // Call service method to create new bookmarks sync and return response as json
            const newSync = await this.service.createBookmarks_v1(bookmarksData, req);
            res.json(newSync);
        }
        catch (err) {
            next(err);
        }
    }
    // Creates an empty sync using sync version and returns new sync ID
    async createBookmarks_v2(req, res, next) {
        try {
            // Get posted sync version
            const syncVersion = req.body.version;
            if (!syncVersion) {
                throw new exception_1.RequiredDataNotFoundException();
            }
            // Call service method to create new sync and return response as json
            const newSync = await this.service.createBookmarks_v2(req.body.version, req);
            res.json(newSync);
        }
        catch (err) {
            next(err);
        }
    }
    // Retrieves an existing sync with a provided sync ID
    async getBookmarks(req, res, next) {
        try {
            // Check sync id has been provided
            const id = this.getSyncId(req);
            // Call service method to retrieve bookmarks data and return response as json
            const bookmarks = await this.service.getBookmarks(id, req);
            res.json(bookmarks);
        }
        catch (err) {
            next(err);
        }
    }
    // Retrieves posted bookmarks data from request body
    getBookmarksData(req) {
        return req.body.bookmarks || '';
    }
    // Retrieves last updated date for a given sync ID
    async getLastUpdated(req, res, next) {
        try {
            // Check sync id has been provided
            const id = this.getSyncId(req);
            // Call service method to get bookmarks last updated date and return response as json
            const lastUpdated = await this.service.getLastUpdated(id, req);
            res.json(lastUpdated);
        }
        catch (err) {
            next(err);
        }
    }
    // Retrieves the sync ID from the request query string parameters
    getSyncId(req) {
        // Check id is valid
        const id = req.params.id;
        uuid_1.convertUuidStringToBinary(id);
        return id;
    }
    // Retrieves sync version for a given sync ID
    async getVersion(req, res, next) {
        try {
            // Check sync id has been provided
            const id = this.getSyncId(req);
            // Call service method to get sync version and return response as json
            const syncVersion = await this.service.getVersion(id, req);
            res.json(syncVersion);
        }
        catch (err) {
            next(err);
        }
    }
    // Updates bookmarks data for a given bookmarks sync ID
    async updateBookmarks_v1(req, res, next) {
        try {
            // Check sync id has been provided
            const id = this.getSyncId(req);
            // Get posted bookmarks data
            const bookmarksData = this.getBookmarksData(req);
            if (bookmarksData === '') {
                throw new exception_1.RequiredDataNotFoundException();
            }
            // Call service method to update bookmarks data and return response as json
            const bookmarksSync = await this.service.updateBookmarks_v1(id, bookmarksData, req);
            res.json(bookmarksSync);
        }
        catch (err) {
            next(err);
        }
    }
    // Updates bookmarks sync bookmarks data and sync version for a given bookmarks sync ID
    async updateBookmarks_v2(req, res, next) {
        try {
            // Check sync id has been provided
            const id = this.getSyncId(req);
            // Get posted bookmarks data
            const bookmarksData = this.getBookmarksData(req);
            if (bookmarksData === '') {
                throw new exception_1.RequiredDataNotFoundException();
            }
            // Call service method to update bookmarks data and return response as json
            const bookmarksSync = await this.service.updateBookmarks_v2(id, bookmarksData, req.body.lastUpdated, req.body.version, req);
            res.json(bookmarksSync);
        }
        catch (err) {
            next(err);
        }
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
exports.BookmarksRouter = BookmarksRouter;
