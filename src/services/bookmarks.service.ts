import { Request } from 'express';
import * as uuid from 'uuid';

import Config from '../core/config';
import {
  InvalidSyncIdException,
  NewSyncsForbiddenException,
  NewSyncsLimitExceededException,
  SyncConflictException,
  UnspecifiedException
} from '../core/exception';
import Server, { LogLevel } from '../core/server';
import BookmarksModel, { IBookmarks } from '../models/bookmarks.model';
import NewSyncLogsService from '../services/newSyncLogs.service';
import BaseService from './base.service';

// Interface for create bookmarks operation response object
export interface ICreateBookmarksResponse {
  version?: string,
  id?: string,
  lastUpdated?: Date
}

// Interface for get bookmarks operation response object
export interface IGetBookmarksResponse {
  bookmarks?: string,
  version?: string,
  lastUpdated?: Date
}

// Interface for get bookmarks last updated date operation response object
export interface IGetLastUpdatedResponse {
  lastUpdated?: Date
}

// Interface for get sync version operation response object
export interface IGetVersionResponse {
  version?: string
}

// Interface for update bookmarks operation response object
export interface IUpdateBookmarksResponse {
  lastUpdated?: Date
}

// Implementation of data service for bookmarks operations
export default class BookmarksService extends BaseService<NewSyncLogsService> {
  // Creates a new bookmarks sync with the supplied bookmarks data
  public async createBookmarks_v1(bookmarksData: string, req: Request): Promise<ICreateBookmarksResponse> {
    // Before proceeding, check service is available
    Server.checkServiceAvailability();

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
      // Get a new sync id
      const id = this.newSyncId();

      // Create new bookmarks payload
      const newBookmarks: IBookmarks = {
        _id: id,
        bookmarks: bookmarksData
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
        id,
        lastUpdated: savedBookmarks.lastUpdated
      };
      return returnObj;
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }
  }

  // Creates an empty sync with the supplied version info
  public async createBookmarks_v2(syncVersion: string, req: Request): Promise<ICreateBookmarksResponse> {
    // Before proceeding, check service is available
    Server.checkServiceAvailability();

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
      // Get a new sync id
      const id = this.newSyncId();

      // Create new bookmarks payload
      const newBookmarks: IBookmarks = {
        _id: id,
        version: syncVersion
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
        id,
        lastUpdated: savedBookmarks.lastUpdated,
        version: savedBookmarks.version
      };
      return returnObj;
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }
  }

  // Retrieves an existing bookmarks sync using the supplied sync ID
  public async getBookmarks(id: string, req: Request): Promise<IGetBookmarksResponse> {
    // Before proceeding, check service is available
    Server.checkServiceAvailability();

    try {
      // Query the db for the existing bookmarks data and update the last accessed date
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        { lastAccessed: new Date() },
        { new: true }
      ).exec();

      if (!updatedBookmarks) {
        throw new InvalidSyncIdException();
      }

      // Return the existing bookmarks data if found 
      const response: IGetBookmarksResponse = {};
      if (updatedBookmarks) {
        response.bookmarks = updatedBookmarks.bookmarks;
        response.version = updatedBookmarks.version;
        response.lastUpdated = updatedBookmarks.lastUpdated;
      }
      return response;
    }
    catch (err) {
      if (!(err instanceof InvalidSyncIdException)) {
        this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarks', req, err);
      }
      throw err;
    }
  }

  // Returns the last updated date for the supplied sync ID
  public async getLastUpdated(id: string, req: Request): Promise<IGetLastUpdatedResponse> {
    // Before proceeding, check service is available
    Server.checkServiceAvailability();

    try {
      // Query the db for the existing bookmarks data and update the last accessed date
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        { lastAccessed: new Date() },
        { new: true }
      ).exec();

      if (!updatedBookmarks) {
        throw new InvalidSyncIdException();
      }

      // Return the last updated date if bookmarks data found 
      const response: IGetLastUpdatedResponse = {};
      if (updatedBookmarks) {
        response.lastUpdated = updatedBookmarks.lastUpdated;
      }
      return response;
    }
    catch (err) {
      if (!(err instanceof InvalidSyncIdException)) {
        this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getLastUpdated', req, err);
      }
      throw err;
    }
  }

  // Returns the sync version for the supplied sync ID
  public async getVersion(id: string, req: Request): Promise<IGetVersionResponse> {
    // Before proceeding, check service is available
    Server.checkServiceAvailability();

    try {
      // Query the db for the existing bookmarks data and update the last accessed date
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        { lastAccessed: new Date() },
        { new: true }
      ).exec();

      if (!updatedBookmarks) {
        throw new InvalidSyncIdException();
      }

      // Return the last updated date if bookmarks data found 
      const response: IGetVersionResponse = {};
      if (updatedBookmarks) {
        response.version = updatedBookmarks.version;
      }
      return response;
    }
    catch (err) {
      if (!(err instanceof InvalidSyncIdException)) {
        this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getVersion', req, err);
      }
      throw err;
    }
  }

  // Returns true/false depending whether the service is currently accepting new syncs
  public async isAcceptingNewSyncs(): Promise<boolean> {
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
  public async updateBookmarks_v1(id: string, bookmarksData: string, req: Request): Promise<IUpdateBookmarksResponse> {
    // Before proceeding, check service is available
    Server.checkServiceAvailability();

    try {
      // Update the bookmarks data corresponding to the sync id in the db
      const now = new Date();
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        {
          bookmarks: bookmarksData,
          lastAccessed: now,
          lastUpdated: now
        },
        { new: true }
      ).exec();

      // Return the last updated date if bookmarks data found and updated
      const response: IGetLastUpdatedResponse = {};
      if (updatedBookmarks) {
        response.lastUpdated = updatedBookmarks.lastUpdated;
      }

      return response;
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }
  }

  // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks and version data
  public async updateBookmarks_v2(id: string, bookmarksData: string, lastUpdated: string, syncVersion: string, req: Request): Promise<IUpdateBookmarksResponse> {
    // Before proceeding, check service is available
    Server.checkServiceAvailability();

    // Create update payload
    const now = new Date();
    const updatePayload: IBookmarks = {
      bookmarks: bookmarksData,
      lastAccessed: now,
      lastUpdated: now
    };
    if (syncVersion) {
      updatePayload.version = syncVersion;
    }

    try {
      // Get the existing bookmarks using the supplied id
      const existingBookmarks = await BookmarksModel.findById(id).exec();
      if (!existingBookmarks) {
        throw new InvalidSyncIdException();
      }

      // Check for sync conflicts using the supplied lastUpdated value 
      if (lastUpdated && lastUpdated !== existingBookmarks.lastUpdated.toISOString()) {
        throw new SyncConflictException();
      }

      // Update the bookmarks data corresponding to the sync id in the db
      const updatedBookmarks = await BookmarksModel.findOneAndUpdate(
        { _id: id },
        updatePayload,
        { new: true }
      ).exec();

      // Return the last updated date if bookmarks data found and updated
      const response: IGetLastUpdatedResponse = {
        lastUpdated: updatedBookmarks.lastUpdated
      };

      return response;
    }
    catch (err) {
      if (!(err instanceof InvalidSyncIdException)) {
        this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      }
      throw err;
    }
  }

  // Returns the total number of existing bookmarks syncs
  private async getBookmarksCount(): Promise<number> {
    let bookmarksCount = -1;

    try {
      bookmarksCount = await BookmarksModel.estimatedDocumentCount().exec();
    }
    catch (err) {
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

  // Generates a new 32 char id string
  private newSyncId(): string {
    let newId: string;

    try {
      // Create a new v4 uuid and return as an unbroken string to use for a unique id
      const bytes: any = uuid.v4(null, Buffer.alloc(16));
      newId = Buffer.from(bytes, 'base64').toString('hex');
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.newSyncId', null, err);
      throw err;
    }

    return newId;
  }
}