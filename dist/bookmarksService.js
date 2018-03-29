"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const api_1 = require("./api");
const baseService_1 = require("./baseService");
const bookmarksModel_1 = require("./bookmarksModel");
// 
class BookmarksService extends baseService_1.default {
    // 
    createBookmarks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for service availability
            this.checkServiceAvailability();
            // Check bookmarks data has been provided
            if (!req.body.bookmarks) {
                const err = new Error();
                err.name = api_1.ApiError.BookmarksDataNotFoundError;
                throw err;
            }
            // Check service is accepting new syncs
            const isAcceptingNewSyncs = yield this.isAcceptingNewSyncs();
            if (!isAcceptingNewSyncs) {
                const err = new Error();
                err.name = api_1.ApiError.NewSyncsForbiddenError;
                throw err;
            }
            if (this.config.dailyNewSyncsLimit > 0) {
                // Check if daily new syncs limit has been hit
                const newSyncsLimitHit = yield this.service.newSyncsLimitHit(req);
                if (newSyncsLimitHit) {
                    const err = new Error();
                    err.name = api_1.ApiError.NewSyncsLimitExceededError;
                    throw err;
                }
            }
            // Get a new sync id
            const id = this.newSyncId();
            if (!id) {
                const err = new Error();
                err.name = api_1.ApiError.SyncIdNotFoundError;
                if (this.config.log.enabled) {
                    this.logger.error({ req, err }, 'Exception occurred in BookmarksService.createBookmarks.');
                }
                throw err;
            }
            try {
                const newBookmarks = {
                    _id: id,
                    bookmarks: req.body.bookmarks,
                    lastAccessed: new Date(),
                    lastUpdated: new Date()
                };
                const bookmarksModel = new bookmarksModel_1.default(newBookmarks);
                const response = yield new Promise((resolve, reject) => {
                    bookmarksModel.save((err, document) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(document);
                        }
                    });
                });
                if (this.config.dailyNewSyncsLimit > 0) {
                    // Add entry to new syncs log
                    const newLog = yield this.service.createLog(req);
                }
                // Add entry to api log file
                if (this.config.log.enabled) {
                    this.logger.info({ req }, 'New bookmarks sync created.');
                }
                // Return the new sync id and last updated datetime
                const returnObj = {
                    id,
                    lastUpdated: response.lastUpdated
                };
                return returnObj;
            }
            catch (err) {
                if (this.config.log.enabled) {
                    this.logger.error({ req, err }, 'Exception occurred in BookmarksService.createBookmarks.');
                }
                throw err;
            }
        });
    }
    //
    getBookmarks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for service availability
            this.checkServiceAvailability();
            // Check sync id has been provided
            const id = this.getSyncId(req);
            try {
                const bookmarks = yield new Promise((resolve, reject) => {
                    bookmarksModel_1.default.findOne({ _id: id }, (err, document) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(document);
                        }
                    });
                });
                const response = {};
                if (bookmarks) {
                    response.bookmarks = bookmarks.bookmarks;
                    response.lastUpdated = bookmarks.lastUpdated;
                }
                return response;
            }
            catch (err) {
                if (this.config.log.enabled) {
                    this.logger.error({ req, err }, 'Exception occurred in BookmarksService.getBookmarks.');
                }
                throw err;
            }
        });
    }
    //
    getLastUpdated(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for service availability
            this.checkServiceAvailability();
            // Check sync id has been provided
            const id = this.getSyncId(req);
            try {
                const bookmarks = yield new Promise((resolve, reject) => {
                    bookmarksModel_1.default.findOne({ _id: id }, (err, document) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(document);
                        }
                    });
                });
                const response = {};
                if (bookmarks) {
                    response.lastUpdated = bookmarks.lastUpdated;
                }
                return response;
            }
            catch (err) {
                if (this.config.log.enabled) {
                    this.logger.error({ req, err }, 'Exception occurred in BookmarksService.getLastUpdated.');
                }
                throw err;
            }
        });
    }
    //
    isAcceptingNewSyncs() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if allowNewSyncs config value enabled
            if (!this.config.status.allowNewSyncs) {
                return false;
            }
            // Check if maxSyncs config value disabled
            if (this.config.maxSyncs === 0) {
                return true;
            }
            // Check if total syncs have reached limit set in config  
            const bookmarksCount = yield this.getBookmarksCount();
            return bookmarksCount < this.config.maxSyncs;
        });
    }
    //
    updateBookmarks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for service availability
            this.checkServiceAvailability();
            // Check bookmarks data has been provided
            if (!req.body.bookmarks) {
                const err = new Error();
                err.name = api_1.ApiError.BookmarksDataNotFoundError;
                throw err;
            }
            // Check sync id has been provided
            const id = this.getSyncId(req);
            try {
                const updatedBookmarks = {
                    _id: undefined,
                    bookmarks: req.body.bookmarks,
                    lastAccessed: new Date(),
                    lastUpdated: new Date()
                };
                const bookmarks = yield new Promise((resolve, reject) => {
                    bookmarksModel_1.default.findOneAndUpdate({ _id: id }, updatedBookmarks, (err, document) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(document);
                        }
                    });
                });
                const response = {};
                if (bookmarks) {
                    response.lastUpdated = updatedBookmarks.lastUpdated;
                }
                return response;
            }
            catch (err) {
                if (this.config.log.enabled) {
                    this.logger.error({ req, err }, 'Exception occurred in BookmarksService.createBookmarks.');
                }
                throw err;
            }
        });
    }
    //
    getBookmarksCount() {
        return new Promise((resolve, reject) => {
            bookmarksModel_1.default.count(null, (err, count) => {
                if (err) {
                    if (this.config.log.enabled) {
                        this.logger.error({ err }, 'Exception occurred in BookmarksService.getBookmarksCount.');
                    }
                    reject(err);
                    return;
                }
                resolve(count);
            });
        });
    }
    // 
    getSyncId(req) {
        const id = req.params.id;
        if (!id) {
            const err = new Error();
            err.name = api_1.ApiError.SyncIdNotFoundError;
            throw err;
        }
        return id;
    }
    // Generates a new 32 char id string
    newSyncId() {
        let newId;
        try {
            const bytes = uuid.v4(null, new Buffer(16));
            newId = new Buffer(bytes, 'base64').toString('hex');
        }
        catch (err) {
            if (this.config.log.enabled) {
                this.logger.error({ err }, 'Exception occurred in BookmarksService.newSyncId.');
            }
        }
        return newId;
    }
}
exports.default = BookmarksService;
//# sourceMappingURL=bookmarksService.js.map