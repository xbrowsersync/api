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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_decorators_1 = require("core-decorators");
var db_1 = require("../core/db");
var exception_1 = require("../core/exception");
var server_1 = require("../core/server");
var base_router_1 = require("../routers/base.router");
// Implementation of routes for bookmarks operations
var BookmarksRouter = /** @class */ (function (_super) {
    __extends(BookmarksRouter, _super);
    function BookmarksRouter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Initialises the routes for this router implementation
    BookmarksRouter.prototype.initRoutes = function () {
        this.app.use('/bookmarks', this.router);
        this.createRoute(server_1.ApiVerb.post, '/', {
            '~1.0.0': this.createBookmarks_v1,
            // tslint:disable-next-line:object-literal-sort-keys
            '^1.1.3': this.createBookmarks_v2
        });
        this.createRoute(server_1.ApiVerb.get, '/:id', { '^1.0.0': this.getBookmarks });
        this.createRoute(server_1.ApiVerb.put, '/:id', {
            '~1.0.0': this.updateBookmarks_v1,
            // tslint:disable-next-line:object-literal-sort-keys
            '^1.1.3': this.updateBookmarks_v2
        });
        this.createRoute(server_1.ApiVerb.get, '/:id/lastUpdated', { '^1.0.0': this.getLastUpdated });
        this.createRoute(server_1.ApiVerb.get, '/:id/version', { '^1.1.3': this.getVersion });
    };
    // Creates a new bookmarks sync and returns new sync ID
    BookmarksRouter.prototype.createBookmarks_v1 = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var bookmarksData, newSync, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        bookmarksData = this.getBookmarksData(req);
                        if (bookmarksData === '') {
                            throw new exception_1.RequiredDataNotFoundException;
                        }
                        return [4 /*yield*/, this.service.createBookmarks_v1(bookmarksData, req)];
                    case 1:
                        newSync = _a.sent();
                        res.json(newSync);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        next(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Creates an empty sync using sync version and returns new sync ID
    BookmarksRouter.prototype.createBookmarks_v2 = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var syncVersion, newSync, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        syncVersion = req.body.version;
                        if (!syncVersion) {
                            throw new exception_1.RequiredDataNotFoundException;
                        }
                        return [4 /*yield*/, this.service.createBookmarks_v2(req.body.version, req)];
                    case 1:
                        newSync = _a.sent();
                        res.json(newSync);
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        next(err_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Retrieves an existing sync with a provided sync ID
    BookmarksRouter.prototype.getBookmarks = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, bookmarks, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = this.getSyncId(req);
                        return [4 /*yield*/, this.service.getBookmarks(id, req)];
                    case 1:
                        bookmarks = _a.sent();
                        res.json(bookmarks);
                        return [3 /*break*/, 3];
                    case 2:
                        err_3 = _a.sent();
                        next(err_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Retrieves posted bookmarks data from request body
    BookmarksRouter.prototype.getBookmarksData = function (req) {
        return req.body.bookmarks || '';
    };
    // Retrieves last updated date for a given sync ID
    BookmarksRouter.prototype.getLastUpdated = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, lastUpdated, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = this.getSyncId(req);
                        return [4 /*yield*/, this.service.getLastUpdated(id, req)];
                    case 1:
                        lastUpdated = _a.sent();
                        res.json(lastUpdated);
                        return [3 /*break*/, 3];
                    case 2:
                        err_4 = _a.sent();
                        next(err_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Retrieves the sync ID from the request query string parameters
    BookmarksRouter.prototype.getSyncId = function (req) {
        var id = req.params.id;
        // Check id is valid
        db_1.default.idIsValid(id);
        return id;
    };
    // Retrieves sync version for a given sync ID
    BookmarksRouter.prototype.getVersion = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, syncVersion, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = this.getSyncId(req);
                        return [4 /*yield*/, this.service.getVersion(id, req)];
                    case 1:
                        syncVersion = _a.sent();
                        res.json(syncVersion);
                        return [3 /*break*/, 3];
                    case 2:
                        err_5 = _a.sent();
                        next(err_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Updates bookmarks data for a given bookmarks sync ID
    BookmarksRouter.prototype.updateBookmarks_v1 = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, bookmarksData, bookmarksSync, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = this.getSyncId(req);
                        bookmarksData = this.getBookmarksData(req);
                        if (bookmarksData === '') {
                            throw new exception_1.RequiredDataNotFoundException;
                        }
                        return [4 /*yield*/, this.service.updateBookmarks_v1(id, bookmarksData, req)];
                    case 1:
                        bookmarksSync = _a.sent();
                        res.json(bookmarksSync);
                        return [3 /*break*/, 3];
                    case 2:
                        err_6 = _a.sent();
                        next(err_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Updates bookmarks sync bookmarks data and sync version for a given bookmarks sync ID
    BookmarksRouter.prototype.updateBookmarks_v2 = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, bookmarksData, bookmarksSync, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = this.getSyncId(req);
                        bookmarksData = this.getBookmarksData(req);
                        if (bookmarksData === '') {
                            throw new exception_1.RequiredDataNotFoundException;
                        }
                        return [4 /*yield*/, this.service.updateBookmarks_v2(id, bookmarksData, req.body.lastUpdated, req.body.version, req)];
                    case 1:
                        bookmarksSync = _a.sent();
                        res.json(bookmarksSync);
                        return [3 /*break*/, 3];
                    case 2:
                        err_7 = _a.sent();
                        next(err_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
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
    return BookmarksRouter;
}(base_router_1.default));
exports.default = BookmarksRouter;
//# sourceMappingURL=bookmarks.router.js.map