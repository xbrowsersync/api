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
var uuid = require("uuid");
var config_1 = require("../core/config");
var exception_1 = require("../core/exception");
var server_1 = require("../core/server");
var bookmarks_model_1 = require("../models/bookmarks.model");
var base_service_1 = require("./base.service");
// Implementation of data service for bookmarks operations
var BookmarksService = /** @class */ (function (_super) {
    __extends(BookmarksService, _super);
    function BookmarksService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Creates a new bookmarks sync with the supplied bookmarks data
    BookmarksService.prototype.createBookmarks_v1 = function (bookmarksData, req) {
        return __awaiter(this, void 0, void 0, function () {
            var isAcceptingNewSyncs, newSyncsLimitHit, id, newBookmarks, bookmarksModel, savedBookmarks, returnObj, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Before proceeding, check service is available
                        server_1.default.checkServiceAvailability();
                        return [4 /*yield*/, this.isAcceptingNewSyncs()];
                    case 1:
                        isAcceptingNewSyncs = _a.sent();
                        if (!isAcceptingNewSyncs) {
                            throw new exception_1.NewSyncsForbiddenException();
                        }
                        if (!(config_1.default.get().dailyNewSyncsLimit > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.service.newSyncsLimitHit(req)];
                    case 2:
                        newSyncsLimitHit = _a.sent();
                        if (newSyncsLimitHit) {
                            throw new exception_1.NewSyncsLimitExceededException();
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        id = this.newSyncId();
                        newBookmarks = {
                            _id: id,
                            bookmarks: bookmarksData
                        };
                        bookmarksModel = new bookmarks_model_1.default(newBookmarks);
                        return [4 /*yield*/, bookmarksModel.save()];
                    case 4:
                        savedBookmarks = _a.sent();
                        if (!(config_1.default.get().dailyNewSyncsLimit > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.service.createLog(req)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        this.log(server_1.LogLevel.Info, 'New bookmarks sync created', req);
                        returnObj = {
                            id: id,
                            lastUpdated: savedBookmarks.lastUpdated
                        };
                        return [2 /*return*/, returnObj];
                    case 7:
                        err_1 = _a.sent();
                        this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err_1);
                        throw err_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Creates an empty sync with the supplied version info
    BookmarksService.prototype.createBookmarks_v2 = function (syncVersion, req) {
        return __awaiter(this, void 0, void 0, function () {
            var isAcceptingNewSyncs, newSyncsLimitHit, id, newBookmarks, bookmarksModel, savedBookmarks, returnObj, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Before proceeding, check service is available
                        server_1.default.checkServiceAvailability();
                        return [4 /*yield*/, this.isAcceptingNewSyncs()];
                    case 1:
                        isAcceptingNewSyncs = _a.sent();
                        if (!isAcceptingNewSyncs) {
                            throw new exception_1.NewSyncsForbiddenException();
                        }
                        if (!(config_1.default.get().dailyNewSyncsLimit > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.service.newSyncsLimitHit(req)];
                    case 2:
                        newSyncsLimitHit = _a.sent();
                        if (newSyncsLimitHit) {
                            throw new exception_1.NewSyncsLimitExceededException();
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        id = this.newSyncId();
                        newBookmarks = {
                            _id: id,
                            version: syncVersion
                        };
                        bookmarksModel = new bookmarks_model_1.default(newBookmarks);
                        return [4 /*yield*/, bookmarksModel.save()];
                    case 4:
                        savedBookmarks = _a.sent();
                        if (!(config_1.default.get().dailyNewSyncsLimit > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.service.createLog(req)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        this.log(server_1.LogLevel.Info, 'New bookmarks sync created', req);
                        returnObj = {
                            id: id,
                            lastUpdated: savedBookmarks.lastUpdated,
                            version: savedBookmarks.version
                        };
                        return [2 /*return*/, returnObj];
                    case 7:
                        err_2 = _a.sent();
                        this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err_2);
                        throw err_2;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Retrieves an existing bookmarks sync using the supplied sync ID
    BookmarksService.prototype.getBookmarks = function (id, req) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedBookmarks, response, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Before proceeding, check service is available
                        server_1.default.checkServiceAvailability();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, bookmarks_model_1.default.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec()];
                    case 2:
                        updatedBookmarks = _a.sent();
                        if (!updatedBookmarks) {
                            throw new exception_1.InvalidSyncIdException();
                        }
                        response = {};
                        if (updatedBookmarks) {
                            response.bookmarks = updatedBookmarks.bookmarks;
                            response.version = updatedBookmarks.version;
                            response.lastUpdated = updatedBookmarks.lastUpdated;
                        }
                        return [2 /*return*/, response];
                    case 3:
                        err_3 = _a.sent();
                        if (!(err_3 instanceof exception_1.InvalidSyncIdException)) {
                            this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarks', req, err_3);
                        }
                        throw err_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Returns the last updated date for the supplied sync ID
    BookmarksService.prototype.getLastUpdated = function (id, req) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedBookmarks, response, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Before proceeding, check service is available
                        server_1.default.checkServiceAvailability();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, bookmarks_model_1.default.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec()];
                    case 2:
                        updatedBookmarks = _a.sent();
                        if (!updatedBookmarks) {
                            throw new exception_1.InvalidSyncIdException();
                        }
                        response = {};
                        if (updatedBookmarks) {
                            response.lastUpdated = updatedBookmarks.lastUpdated;
                        }
                        return [2 /*return*/, response];
                    case 3:
                        err_4 = _a.sent();
                        if (!(err_4 instanceof exception_1.InvalidSyncIdException)) {
                            this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.getLastUpdated', req, err_4);
                        }
                        throw err_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Returns the sync version for the supplied sync ID
    BookmarksService.prototype.getVersion = function (id, req) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedBookmarks, response, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Before proceeding, check service is available
                        server_1.default.checkServiceAvailability();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, bookmarks_model_1.default.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec()];
                    case 2:
                        updatedBookmarks = _a.sent();
                        if (!updatedBookmarks) {
                            throw new exception_1.InvalidSyncIdException();
                        }
                        response = {};
                        if (updatedBookmarks) {
                            response.version = updatedBookmarks.version;
                        }
                        return [2 /*return*/, response];
                    case 3:
                        err_5 = _a.sent();
                        if (!(err_5 instanceof exception_1.InvalidSyncIdException)) {
                            this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.getVersion', req, err_5);
                        }
                        throw err_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Returns true/false depending whether the service is currently accepting new syncs
    BookmarksService.prototype.isAcceptingNewSyncs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bookmarksCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check if allowNewSyncs config value enabled
                        if (!config_1.default.get().status.allowNewSyncs) {
                            return [2 /*return*/, false];
                        }
                        // Check if maxSyncs config value disabled
                        if (config_1.default.get().maxSyncs === 0) {
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.getBookmarksCount()];
                    case 1:
                        bookmarksCount = _a.sent();
                        return [2 /*return*/, bookmarksCount < config_1.default.get().maxSyncs];
                }
            });
        });
    };
    // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks data
    BookmarksService.prototype.updateBookmarks_v1 = function (id, bookmarksData, req) {
        return __awaiter(this, void 0, void 0, function () {
            var now, updatedBookmarks, response, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Before proceeding, check service is available
                        server_1.default.checkServiceAvailability();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        now = new Date();
                        return [4 /*yield*/, bookmarks_model_1.default.findOneAndUpdate({ _id: id }, {
                                bookmarks: bookmarksData,
                                lastAccessed: now,
                                lastUpdated: now
                            }, { new: true }).exec()];
                    case 2:
                        updatedBookmarks = _a.sent();
                        response = {};
                        if (updatedBookmarks) {
                            response.lastUpdated = updatedBookmarks.lastUpdated;
                        }
                        return [2 /*return*/, response];
                    case 3:
                        err_6 = _a.sent();
                        this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err_6);
                        throw err_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks and version data
    BookmarksService.prototype.updateBookmarks_v2 = function (id, bookmarksData, lastUpdated, syncVersion, req) {
        return __awaiter(this, void 0, void 0, function () {
            var now, updatePayload, existingBookmarks, updatedBookmarks, response, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Before proceeding, check service is available
                        server_1.default.checkServiceAvailability();
                        now = new Date();
                        updatePayload = {
                            bookmarks: bookmarksData,
                            lastAccessed: now,
                            lastUpdated: now
                        };
                        if (syncVersion) {
                            updatePayload.version = syncVersion;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, bookmarks_model_1.default.findById(id).exec()];
                    case 2:
                        existingBookmarks = _a.sent();
                        if (!existingBookmarks) {
                            throw new exception_1.InvalidSyncIdException();
                        }
                        // Check for sync conflicts using the supplied lastUpdated value 
                        if (lastUpdated && lastUpdated !== existingBookmarks.lastUpdated.toISOString()) {
                            throw new exception_1.SyncConflictException();
                        }
                        return [4 /*yield*/, bookmarks_model_1.default.findOneAndUpdate({ _id: id }, updatePayload, { new: true }).exec()];
                    case 3:
                        updatedBookmarks = _a.sent();
                        response = {
                            lastUpdated: updatedBookmarks.lastUpdated
                        };
                        return [2 /*return*/, response];
                    case 4:
                        err_7 = _a.sent();
                        if (!(err_7 instanceof exception_1.InvalidSyncIdException)) {
                            this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err_7);
                        }
                        throw err_7;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Returns the total number of existing bookmarks syncs
    BookmarksService.prototype.getBookmarksCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bookmarksCount, err_8, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bookmarksCount = -1;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, bookmarks_model_1.default.estimatedDocumentCount().exec()];
                    case 2:
                        bookmarksCount = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_8 = _a.sent();
                        this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarksCount', null, err_8);
                        throw err_8;
                    case 4:
                        // Ensure a valid count was returned
                        if (bookmarksCount < 0) {
                            err = new exception_1.UnspecifiedException('Bookmarks count cannot be less than zero');
                            this.log(server_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', null, err);
                            throw err;
                        }
                        return [2 /*return*/, bookmarksCount];
                }
            });
        });
    };
    // Generates a new 32 char id string
    BookmarksService.prototype.newSyncId = function () {
        var newId;
        try {
            // Create a new v4 uuid and return as an unbroken string to use for a unique id
            var bytes = uuid.v4(null, Buffer.alloc(16));
            newId = Buffer.from(bytes, 'base64').toString('hex');
        }
        catch (err) {
            this.log(server_1.LogLevel.Error, 'Exception occurred in BookmarksService.newSyncId', null, err);
            throw err;
        }
        return newId;
    };
    return BookmarksService;
}(base_service_1.default));
exports.default = BookmarksService;
//# sourceMappingURL=bookmarks.service.js.map