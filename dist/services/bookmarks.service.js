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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarksService = void 0;
const enums_1 = require("../common/enums");
const utils_1 = require("../common/utils");
const Config = __importStar(require("../config"));
const exception_1 = require("../exception");
const bookmarks_model_1 = require("../models/bookmarks.model");
const api_service_1 = require("./api.service");
// Implementation of data service for bookmarks operations
class BookmarksService extends api_service_1.ApiService {
    // Creates a new bookmarks sync with the supplied bookmarks data
    async createBookmarks_v1(bookmarksData, req) {
        // Before proceeding, check service is available
        utils_1.checkServiceAvailability();
        // Check service is accepting new syncs
        const isAcceptingNewSyncs = await this.isAcceptingNewSyncs();
        if (!isAcceptingNewSyncs) {
            throw new exception_1.NewSyncsForbiddenException();
        }
        // Check if daily new syncs limit has been hit if config value enabled
        if (Config.get().dailyNewSyncsLimit > 0) {
            const newSyncsLimitHit = await this.service.newSyncsLimitHit(req);
            if (newSyncsLimitHit) {
                throw new exception_1.NewSyncsLimitExceededException();
            }
        }
        try {
            // Create new bookmarks payload
            const newBookmarks = {
                bookmarks: bookmarksData,
            };
            const bookmarksModel = new bookmarks_model_1.BookmarksModel(newBookmarks);
            // Commit the bookmarks payload to the db
            const savedBookmarks = await bookmarksModel.save();
            // Add to logs
            if (Config.get().dailyNewSyncsLimit > 0) {
                await this.service.createLog(req);
            }
            this.log(enums_1.LogLevel.Info, 'New bookmarks sync created', req);
            // Return the response data
            const returnObj = {
                id: savedBookmarks._id,
                lastUpdated: savedBookmarks.lastUpdated,
            };
            return returnObj;
        }
        catch (err) {
            this.log(enums_1.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
            throw err;
        }
    }
    // Creates an empty sync with the supplied version info
    async createBookmarks_v2(syncVersion, req) {
        // Before proceeding, check service is available
        utils_1.checkServiceAvailability();
        // Check service is accepting new syncs
        const isAcceptingNewSyncs = await this.isAcceptingNewSyncs();
        if (!isAcceptingNewSyncs) {
            throw new exception_1.NewSyncsForbiddenException();
        }
        // Check if daily new syncs limit has been hit if config value enabled
        if (Config.get().dailyNewSyncsLimit > 0) {
            const newSyncsLimitHit = await this.service.newSyncsLimitHit(req);
            if (newSyncsLimitHit) {
                throw new exception_1.NewSyncsLimitExceededException();
            }
        }
        try {
            // Create new bookmarks payload
            const newBookmarks = {
                version: syncVersion,
            };
            const bookmarksModel = new bookmarks_model_1.BookmarksModel(newBookmarks);
            // Commit the bookmarks payload to the db
            const savedBookmarks = await bookmarksModel.save();
            // Add to logs
            if (Config.get().dailyNewSyncsLimit > 0) {
                await this.service.createLog(req);
            }
            this.log(enums_1.LogLevel.Info, 'New bookmarks sync created', req);
            // Return the response data
            const returnObj = {
                id: savedBookmarks._id,
                lastUpdated: savedBookmarks.lastUpdated,
                version: savedBookmarks.version,
            };
            return returnObj;
        }
        catch (err) {
            this.log(enums_1.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
            throw err;
        }
    }
    // Retrieves an existing bookmarks sync using the supplied sync ID
    async getBookmarks(id, req) {
        // Before proceeding, check service is available
        utils_1.checkServiceAvailability();
        try {
            // Query the db for the existing bookmarks data and update the last accessed date
            const updatedBookmarks = await bookmarks_model_1.BookmarksModel.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec();
            if (!updatedBookmarks) {
                throw new exception_1.SyncNotFoundException();
            }
            // Return the existing bookmarks data if found
            const response = {
                bookmarks: updatedBookmarks.bookmarks,
                version: updatedBookmarks.version,
                lastUpdated: updatedBookmarks.lastUpdated,
            };
            return response;
        }
        catch (err) {
            if (!(err instanceof exception_1.SyncNotFoundException)) {
                this.log(enums_1.LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarks', req, err);
            }
            throw err;
        }
    }
    // Returns the last updated date for the supplied sync ID
    async getLastUpdated(id, req) {
        // Before proceeding, check service is available
        utils_1.checkServiceAvailability();
        try {
            // Query the db for the existing bookmarks data and update the last accessed date
            const updatedBookmarks = await bookmarks_model_1.BookmarksModel.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec();
            if (!updatedBookmarks) {
                throw new exception_1.SyncNotFoundException();
            }
            // Return the last updated date if bookmarks data found
            const response = {
                lastUpdated: updatedBookmarks.lastUpdated,
            };
            return response;
        }
        catch (err) {
            if (!(err instanceof exception_1.SyncNotFoundException)) {
                this.log(enums_1.LogLevel.Error, 'Exception occurred in BookmarksService.getLastUpdated', req, err);
            }
            throw err;
        }
    }
    // Returns the sync version for the supplied sync ID
    async getVersion(id, req) {
        // Before proceeding, check service is available
        utils_1.checkServiceAvailability();
        try {
            // Query the db for the existing bookmarks data and update the last accessed date
            const updatedBookmarks = await bookmarks_model_1.BookmarksModel.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec();
            if (!updatedBookmarks) {
                throw new exception_1.SyncNotFoundException();
            }
            // Return the last updated date if bookmarks data found
            const response = {
                version: updatedBookmarks.version,
            };
            return response;
        }
        catch (err) {
            if (!(err instanceof exception_1.SyncNotFoundException)) {
                this.log(enums_1.LogLevel.Error, 'Exception occurred in BookmarksService.getVersion', req, err);
            }
            throw err;
        }
    }
    // Returns true/false depending whether the service is currently accepting new syncs
    async isAcceptingNewSyncs() {
        // Check if allowNewSyncs config value enabled
        if (!Config.get().status.allowNewSyncs) {
            return false;
        }
        // Check if maxSyncs config value disabled
        if (Config.get().maxSyncs === 0) {
            return true;
        }
        // Check if total syncs have reached limit set in config
        const bookmarksCount = await this.getBookmarksCount();
        return bookmarksCount < Config.get().maxSyncs;
    }
    // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks data
    async updateBookmarks_v1(id, bookmarksData, req) {
        // Before proceeding, check service is available
        utils_1.checkServiceAvailability();
        try {
            // Update the bookmarks data corresponding to the sync id in the db
            const now = new Date();
            const updatedBookmarks = await bookmarks_model_1.BookmarksModel.findOneAndUpdate({ _id: id }, {
                bookmarks: bookmarksData,
                lastAccessed: now,
                lastUpdated: now,
            }, { new: true }).exec();
            // Return the last updated date if bookmarks data found and updated
            const response = {};
            if (updatedBookmarks) {
                response.lastUpdated = updatedBookmarks.lastUpdated;
            }
            return response;
        }
        catch (err) {
            this.log(enums_1.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
            throw err;
        }
    }
    // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks and version data
    async updateBookmarks_v2(id, bookmarksData, lastUpdated, syncVersion, req) {
        // Before proceeding, check service is available
        utils_1.checkServiceAvailability();
        // Create update payload
        const now = new Date();
        const updatePayload = {
            bookmarks: bookmarksData,
            lastAccessed: now,
            lastUpdated: now,
        };
        if (syncVersion) {
            updatePayload.version = syncVersion;
        }
        try {
            // Get the existing bookmarks using the supplied id
            const existingBookmarks = await bookmarks_model_1.BookmarksModel.findById(id).exec();
            if (!existingBookmarks) {
                throw new exception_1.SyncNotFoundException();
            }
            // Check for sync conflicts using the supplied lastUpdated value
            if (lastUpdated && lastUpdated !== existingBookmarks.lastUpdated.toISOString()) {
                throw new exception_1.SyncConflictException();
            }
            // Update the bookmarks data corresponding to the sync id in the db
            const updatedBookmarks = await bookmarks_model_1.BookmarksModel.findOneAndUpdate({ _id: id }, updatePayload, { new: true }).exec();
            // Return the last updated date if bookmarks data found and updated
            const response = {
                lastUpdated: updatedBookmarks.lastUpdated,
            };
            return response;
        }
        catch (err) {
            if (!(err instanceof exception_1.SyncNotFoundException)) {
                this.log(enums_1.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
            }
            throw err;
        }
    }
    // Returns the total number of existing bookmarks syncs
    async getBookmarksCount() {
        let bookmarksCount = -1;
        try {
            bookmarksCount = await bookmarks_model_1.BookmarksModel.estimatedDocumentCount().exec();
        }
        catch (err) {
            this.log(enums_1.LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarksCount', null, err);
            throw err;
        }
        // Ensure a valid count was returned
        if (bookmarksCount < 0) {
            const err = new exception_1.UnspecifiedException('Bookmarks count cannot be less than zero');
            this.log(enums_1.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', null, err);
            throw err;
        }
        return bookmarksCount;
    }
}
exports.BookmarksService = BookmarksService;
