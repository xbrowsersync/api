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
const uuid = require("node-uuid");
const bookmarksModel_1 = require("./bookmarksModel");
// 
class BookmarksService {
    constructor(newSyncLogsService, logger) {
        this.config = require('./config.json');
        this.newSyncLogsService = newSyncLogsService;
        this.logger = logger;
    }
    // 
    checkServiceAvailability() {
        if (this.config.status.offline) {
            throw new Error('Service not available.');
        }
    }
    // 
    createBookmarks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for service availability
            this.checkServiceAvailability();
            // Check bookmarks data has been provided
            if (!req.body.bookmarks) {
                throw new Error('Bookmarks data not found');
            }
            // Check service is accepting new syncs
            const isAcceptingNewSyncs = yield this.isAcceptingNewSyncs();
            if (!isAcceptingNewSyncs) {
                throw new Error('Not accepting new syncs');
            }
            if (this.config.dailyNewSyncsLimit > 0) {
                // Check if daily new syncs limit has been hit
                const newSyncsLimitHit = yield this.newSyncLogsService.newSyncsLimitHit(req);
                if (newSyncsLimitHit) {
                    throw new Error('Daily new syncs limit exceeded');
                }
            }
            // Get a new sync id
            const id = this.newSyncId();
            if (!id) {
                const err = new Error('Bookmarks sync ID cannot be null');
                if (this.config.log.enabled) {
                    this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarks.');
                }
                throw err;
            }
            try {
                const createBookmarks = new bookmarksModel_1.default({
                    _id: id,
                    bookmarks: req.body.bookmarks,
                    lastAccessed: new Date(),
                    lastUpdated: new Date()
                });
                const newBookmarks = yield new Promise((resolve, reject) => {
                    createBookmarks.save((err, document) => {
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
                    const newLog = yield this.newSyncLogsService.createLog(req);
                }
                // Add entry to api log file
                if (this.config.log.enabled) {
                    this.logger.info({ req: req }, 'New bookmarks sync created.');
                }
                // Return the new sync id and last updated datetime
                return {
                    id: id,
                    lastUpdated: newBookmarks.lastUpdated
                };
            }
            catch (err) {
                if (this.config.log.enabled) {
                    this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarks.');
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
            const id = req.params.id;
            if (!id) {
                throw new Error('Sync ID not found');
            }
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
                    this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.getBookmarks.');
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
                        this.logger.error({ err: err }, 'Exception occurred in BookmarksService.getBookmarksCount.');
                    }
                    reject(err);
                    return;
                }
                resolve(count);
            });
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
    // Generates a new 32 char id string
    newSyncId() {
        let newId;
        try {
            const bytes = uuid.v4(null, new Buffer(16));
            newId = new Buffer(bytes, 'base64').toString('hex');
        }
        catch (err) {
            if (this.config.log.enabled) {
                this.logger.error({ err: err }, 'Exception occurred in BookmarksService.newSyncId.');
            }
        }
        return newId;
    }
}
exports.default = BookmarksService;
//# sourceMappingURL=bookmarksService.js.map