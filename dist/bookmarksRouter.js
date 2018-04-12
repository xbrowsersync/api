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
const baseRouter_1 = require("./baseRouter");
const db_1 = require("./db");
const exception_1 = require("./exception");
const server_1 = require("./server");
// Implementation of routes for bookmarks operations
class BookmarksRouter extends baseRouter_1.default {
    // Initialises the routes for this router implementation
    initRoutes() {
        this.createRoute(server_1.ApiVerb.post, '/', '^1.0.0', this.createBookmarks);
        this.createRoute(server_1.ApiVerb.get, '/:id', '^1.0.0', this.getBookmarks);
        this.createRoute(server_1.ApiVerb.put, '/:id', '^1.0.0', this.updateBookmarks);
        this.createRoute(server_1.ApiVerb.get, '/:id/lastUpdated', '^1.0.0', this.getLastUpdated);
    }
    // Creates a new bookmarks sync and returns new sync ID
    createBookmarks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get posted bookmarks data
                const bookmarksData = this.getBookmarksData(req);
                // Call service method to create new bookmarks sync and return response as json
                const newBookmarksSync = yield this.service.createBookmarks(bookmarksData, req);
                res.json(newBookmarksSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Retrieves an existing bookmarks sync with a provided sync ID
    getBookmarks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check sync id has been provided
                const id = this.getSyncId(req);
                // Call service method to retrieve bookmarks data and return response as json
                const bookmarksSync = yield this.service.getBookmarks(id, req);
                res.json(bookmarksSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Retrieves posted bookmarks data from request body
    getBookmarksData(req) {
        if (!req.body.bookmarks) {
            throw new exception_1.BookmarksDataNotFoundException;
        }
        return req.body.bookmarks;
    }
    // Retrieves last updated date for a given bookmarks sync ID
    getLastUpdated(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check sync id has been provided
                const id = this.getSyncId(req);
                // Call service method to get bookmarks last updated date and return response as json
                const bookmarksSync = yield this.service.getLastUpdated(id, req);
                res.json(bookmarksSync);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Retrieves the bookmarks sync ID from the request query string parameters
    getSyncId(req) {
        const id = req.params.id;
        // Check id is valid
        db_1.default.idIsValid(id);
        return id;
    }
    // Updates bookmarks data for a given bookmarks sync ID
    updateBookmarks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check sync id has been provided
                const id = this.getSyncId(req);
                // Get posted bookmarks data
                const bookmarksData = this.getBookmarksData(req);
                // Call service method to update bookmarks data and return response as json
                const bookmarksSync = yield this.service.updateBookmarks(id, bookmarksData, req);
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