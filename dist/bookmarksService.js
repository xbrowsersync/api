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
    constructor(logger) {
        this.config = require('./config.json');
        this.logger = logger;
    }
    //
    createBookmarksSync(req) {
        return new Promise((resolve, reject) => {
            const id = this.newBookmarksSyncId();
            if (!id) {
                const err = new Error('Bookmarks sync ID cannot be null.');
                this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarksSync.');
                return Promise.reject(err);
            }
            const newBookmarksSync = new bookmarksModel_1.default({
                _id: id,
                bookmarks: 'asdasd',
                lastAccessed: new Date(),
                lastUpdated: new Date()
            });
            newBookmarksSync.save((err, newItem) => {
                if (err) {
                    this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarksSync.');
                    reject(err);
                    return;
                }
                resolve({
                    id: id,
                    lastUpdated: newItem.lastUpdated
                });
            });
        });
    }
    //
    getBookmarksSync(req) {
        return new Promise((resolve, reject) => {
            const id = req.params.id;
            if (!id) {
                // TODO: return error { "code": "MissingParameter", "message": "No bookmarks provided" }
            }
            bookmarksModel_1.default.findOne({ _id: id }, (err, bookmarksSync) => {
                if (err) {
                    this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarksSync.');
                    reject(err);
                    return;
                }
                if (!bookmarksSync) {
                    resolve();
                }
                else {
                    resolve({
                        bookmarks: bookmarksSync.bookmarks,
                        lastUpdated: bookmarksSync.lastUpdated
                    });
                }
            });
            /*newBookmarksSync.save((err, newItem) => {
              if (err) {
                reject(err);
                return;
              }
      
              resolve({
                id: id,
                lastUpdated: newItem.lastUpdated
              } as iCreateBookmarksSyncResponse);
            });*/
        });
    }
    //
    isAcceptingNewSyncs() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check config variable first
            if (!this.config.status.allowNewSyncs) {
                return Promise.resolve(false);
            }
            // Check if total syncs have reached limit set in config  
            const totalBookmarksSyncs = yield this.getTotalBookmarksSyncs();
            return totalBookmarksSyncs < this.config.maxSyncs;
        });
    }
    //
    getTotalBookmarksSyncs() {
        return new Promise((resolve, reject) => {
            bookmarksModel_1.default.count(null, (err, count) => {
                if (err) {
                    this.logger.error({ err: err }, 'Exception occurred in BookmarksService.getTotalBookmarksSyncs.');
                    reject(err);
                    return;
                }
                resolve(count);
            });
        });
    }
    // Generates a new 32 char id string
    newBookmarksSyncId() {
        let newId;
        try {
            const bytes = uuid.v4(null, new Buffer(16));
            newId = new Buffer(bytes, 'base64').toString('hex');
        }
        catch (err) {
            this.logger.error({ err: err }, 'Exception occurred in BookmarksService.newBookmarksSyncId.');
        }
        return newId;
    }
}
exports.default = BookmarksService;
//# sourceMappingURL=bookmarksService.js.map