import { Request } from 'express';
import { LogLevel } from '../common/enums';
import { checkServiceAvailability } from '../common/utils';
import * as Config from '../config';
import {
  NewSyncsForbiddenException,
  NewSyncsLimitExceededException,
  SyncConflictException,
  SyncNotFoundException,
  UnspecifiedException,
} from '../exception';
import { BookmarksModel, IBookmarks } from '../models/bookmarks.model';
import { ApiService } from './api.service';
import { NewSyncLogsService } from './newSyncLogs.service';

// Interface for create bookmarks operation response object
export interface ICreateBookmarksResponse {
  version?: string;
  id?: string;
  lastUpdated?: Date;
}

// Interface for get bookmarks operation response object
export interface IGetBookmarksResponse {
  bookmarks?: string;
  version?: string;
  lastUpdated?: Date;
}

// Interface for get bookmarks last updated date operation response object
export interface IGetLastUpdatedResponse {
  lastUpdated?: Date;
}

// Interface for get sync version operation response object
export interface IGetVersionResponse {
  version?: string;
}

// Interface for update bookmarks operation response object
export interface IUpdateBookmarksResponse {
  lastUpdated?: Date;
}

// Implementation of data service for bookmarks operations
export class BookmarksService extends ApiService<NewSyncLogsService> {
  // Creates a new bookmarks sync with the supplied bookmarks data
  async createBookmarks_v1(bookmarksData: string, req: Request): Promise<ICreateBookmarksResponse> {
    // Before proceeding, check service is available
    checkServiceAvailability();

    // Check service is accepting new syncs
    const isAcceptingNewSyncs = await this.isAcceptingNewSyncs();
    if (!isAcceptingNewSyncs) {
      throw new NewSyncsForbiddenException();
    }

    // Check if daily new syncs limit has been hit if config value enabled
    if (Config.get().dailyNewSyncsLimit > 0) {
      const newSyncsLimitHit = await this.service.newSyncsLimitHit(req);
      if (newSyncsLimitHit) {
        throw new NewSyncsLimitExceededException();
      }
    }

    try {
      // Create new bookmarks payload
      const newBookmarks: IBookmarks = {
        bookmarks: bookmarksData,
      };
      const bookmarksModel = new BookmarksModel(newBookmarks);

      // Commit the bookmarks payload to the db
      const savedBookmarks = await bookmarksModel.save();

      // Add to logs
      if (Config.get().dailyNewSyncsLimit > 0) {
        await this.service.createLog(req);
      }
      this.log(LogLevel.Info, 'New bookmarks sync created', req);

      // Return the response data
      const returnObj: ICreateBookmarksResponse = {
        id: savedBookmarks._id,
        lastUpdated: savedBookmarks.lastUpdated,
      };
      return returnObj;
    } catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }
  }

  // Creates an empty sync with the supplied version info
  async createBookmarks_v2(syncVersion: string, req: Request): Promise<ICreateBookmarksResponse> {
    // Before proceeding, check service is available
    checkServiceAvailability();

    // Check service is accepting new syncs
    const isAcceptingNewSyncs = await this.isAcceptingNewSyncs();
    if (!isAcceptingNewSyncs) {
      throw new NewSyncsForbiddenException();
    }

    // Check if daily new syncs limit has been hit if config value enabled
    if (Config.get().dailyNewSyncsLimit > 0) {
      const newSyncsLimitHit = await this.service.newSyncsLimitHit(req);
      if (newSyncsLimitHit) {
        throw new NewSyncsLimitExceededException();
      }
    }

    try {
      // Create new bookmarks payload
      const newBookmarks: IBookmarks = {
        version: syncVersion,
      };
      const bookmarksModel = new BookmarksModel(newBookmarks);

      // Commit the bookmarks payload to the db
      const savedBookmarks = await bookmarksModel.save();

      // Add to logs
      if (Config.get().dailyNewSyncsLimit > 0) {
        await this.service.createLog(req);
      }
      this.log(LogLevel.Info, 'New bookmarks sync created', req);

      // Return the response data
      const returnObj: ICreateBookmarksResponse = {
        id: savedBookmarks._id,
        lastUpdated: savedBookmarks.lastUpdated,
        version: savedBookmarks.version,
      };
      return returnObj;
    } catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }
  }

  // Retrieves an existing bookmarks sync using the supplied sync ID
  async getBookmarks(id: string, req: Request): Promise<IGetBookmarksResponse> {
    // Before proceeding, check service is available
    checkServiceAvailability();

    try {
      // Query the db for the existing bookmarks data and update the last accessed date
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        { lastAccessed: new Date() },
        { new: true }
      ).exec();

      if (!updatedBookmarks) {
        throw new SyncNotFoundException();
      }

      // Return the existing bookmarks data if found
      const response: IGetBookmarksResponse = {
        bookmarks: updatedBookmarks.bookmarks,
        version: updatedBookmarks.version,
        lastUpdated: updatedBookmarks.lastUpdated,
      };
      return response;
    } catch (err) {
      if (!(err instanceof SyncNotFoundException)) {
        this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarks', req, err);
      }
      throw err;
    }
  }

  // Returns the last updated date for the supplied sync ID
  async getLastUpdated(id: string, req: Request): Promise<IGetLastUpdatedResponse> {
    // Before proceeding, check service is available
    checkServiceAvailability();

    try {
      // Query the db for the existing bookmarks data and update the last accessed date
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        { lastAccessed: new Date() },
        { new: true }
      ).exec();

      if (!updatedBookmarks) {
        throw new SyncNotFoundException();
      }

      // Return the last updated date if bookmarks data found
      const response: IGetLastUpdatedResponse = {
        lastUpdated: updatedBookmarks.lastUpdated,
      };
      return response;
    } catch (err) {
      if (!(err instanceof SyncNotFoundException)) {
        this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getLastUpdated', req, err);
      }
      throw err;
    }
  }

  // Returns the sync version for the supplied sync ID
  async getVersion(id: string, req: Request): Promise<IGetVersionResponse> {
    // Before proceeding, check service is available
    checkServiceAvailability();

    try {
      // Query the db for the existing bookmarks data and update the last accessed date
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        { lastAccessed: new Date() },
        { new: true }
      ).exec();

      if (!updatedBookmarks) {
        throw new SyncNotFoundException();
      }

      // Return the last updated date if bookmarks data found
      const response: IGetVersionResponse = {
        version: updatedBookmarks.version,
      };
      return response;
    } catch (err) {
      if (!(err instanceof SyncNotFoundException)) {
        this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getVersion', req, err);
      }
      throw err;
    }
  }

  // Returns true/false depending whether the service is currently accepting new syncs
  async isAcceptingNewSyncs(): Promise<boolean> {
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
  async updateBookmarks_v1(id: string, bookmarksData: string, req: Request): Promise<IUpdateBookmarksResponse> {
    // Before proceeding, check service is available
    checkServiceAvailability();

    try {
      // Update the bookmarks data corresponding to the sync id in the db
      const now = new Date();
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        {
          bookmarks: bookmarksData,
          lastAccessed: now,
          lastUpdated: now,
        },
        { new: true }
      ).exec();

      // Return the last updated date if bookmarks data found and updated
      const response: IGetLastUpdatedResponse = {};
      if (updatedBookmarks) {
        response.lastUpdated = updatedBookmarks.lastUpdated;
      }

      return response;
    } catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }
  }

  // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks and version data
  async updateBookmarks_v2(
    id: string,
    bookmarksData: string,
    lastUpdated: string,
    syncVersion: string,
    req: Request
  ): Promise<IUpdateBookmarksResponse> {
    // Before proceeding, check service is available
    checkServiceAvailability();

    // Create update payload
    const now = new Date();
    const updatePayload: IBookmarks = {
      bookmarks: bookmarksData,
      lastAccessed: now,
      lastUpdated: now,
    };
    if (syncVersion) {
      updatePayload.version = syncVersion;
    }

    try {
      // Get the existing bookmarks using the supplied id
      const existingBookmarks = await BookmarksModel.findById(id).exec();
      if (!existingBookmarks) {
        throw new SyncNotFoundException();
      }

      // Check for sync conflicts using the supplied lastUpdated value
      if (lastUpdated && lastUpdated !== existingBookmarks.lastUpdated.toISOString()) {
        throw new SyncConflictException();
      }

      // Update the bookmarks data corresponding to the sync id in the db
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate({ _id: id }, updatePayload, { new: true }).exec();

      // Return the last updated date if bookmarks data found and updated
      const response: IGetLastUpdatedResponse = {
        lastUpdated: updatedBookmarks.lastUpdated,
      };

      return response;
    } catch (err) {
      if (!(err instanceof SyncNotFoundException)) {
        this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      }
      throw err;
    }
  }

  // Returns the total number of existing bookmarks syncs
  async getBookmarksCount(): Promise<number> {
    let bookmarksCount = -1;

    try {
      bookmarksCount = await BookmarksModel.estimatedDocumentCount().exec();
    } catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarksCount', null, err);
      throw err;
    }

    // Ensure a valid count was returned
    if (bookmarksCount < 0) {
      const err = new UnspecifiedException('Bookmarks count cannot be less than zero');
      this.log(LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', null, err);
      throw err;
    }

    return bookmarksCount;
  }
}
