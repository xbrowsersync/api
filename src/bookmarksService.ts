import { Request } from 'express';
import * as uuid from 'uuid';
import { LogLevel } from './api';
import BaseService from './baseService';
import BookmarksModel, { IBookmarks, IBookmarksModel } from './bookmarksModel';
import { NewSyncsForbiddenException, NewSyncsLimitExceededException, SyncIdNotFoundException } from './exception';
import NewSyncLogsService from './newSyncLogsService';

// Interface for create bookmarks operation response object
export interface ICreateBookmarksResponse {
  id?: string,
  lastUpdated?: Date
}

// Interface for get bookmarks operation response object
export interface IGetBookmarksResponse {
  bookmarks?: string,
  lastUpdated?: Date
}

// Interface for get bookmarks last updated date operation response object
export interface IGetLastUpdatedResponse {
  lastUpdated?: Date
}

// Interface for update bookmarks operation response object
export interface IUpdateBookmarksResponse {
  lastUpdated?: Date
}

// Implementation of data service for bookmarks operations
export default class BookmarksService extends BaseService<NewSyncLogsService> {
  // Creates a new bookmarks sync with the supplied bookmarks data
  // Returns a new sync ID and last updated date
  public async createBookmarks(bookmarksData: string, req: Request): Promise<ICreateBookmarksResponse> {
    // Before proceeding, check service is available
    this.checkServiceAvailability();

    // Check service is accepting new syncs
    const isAcceptingNewSyncs = await this.isAcceptingNewSyncs();
    if (!isAcceptingNewSyncs) {
      throw new NewSyncsForbiddenException();
    }

    // Check if daily new syncs limit has been hit if config value enabled
    if (this.config.dailyNewSyncsLimit > 0) {
      const newSyncsLimitHit = await this.service.newSyncsLimitHit(req);
      if (newSyncsLimitHit) {
        throw new NewSyncsLimitExceededException();
      }
    }

    // Get a new sync id
    const id = this.newSyncId();
    if (!id) {
      const err = new SyncIdNotFoundException();
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }

    try {
      // Create new bookmarks payload
      const newBookmarks: IBookmarks = {
        _id: id,
        bookmarks: bookmarksData,
        lastAccessed: new Date(),
        lastUpdated: new Date()
      };
      const bookmarksModel = new BookmarksModel(newBookmarks);

      // Commit the bookmarks payload to the db
      const result = await new Promise<IBookmarksModel>((resolve, reject) => {
        bookmarksModel.save((err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      // Add to logs
      if (this.config.dailyNewSyncsLimit > 0) {
        await this.service.createLog(req);
      }
      this.log(LogLevel.Info, 'New bookmarks sync created', req);

      // Return the response data
      const returnObj: ICreateBookmarksResponse = {
        id,
        lastUpdated: result.lastUpdated
      };
      return returnObj;
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }
  }

  // Retrieves an existing bookmarks sync using the supplied sync ID
  // Returns the corresponding bookmarks data and last updated date
  public async getBookmarks(id: string, req: Request): Promise<IGetBookmarksResponse> {
    // Before proceeding, check service is available
    this.checkServiceAvailability();

    try {
      // Query the db for the existing bookmarks data and update the last accessed date
      const result = await new Promise<IBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOneAndUpdate(
          { _id: id },
          { lastAccessed: new Date() },
          (err, document) => {
            if (err) {
              reject(err);
            }
            else {
              resolve(document);
            }
          });
      });

      // Return the existing bookmarks data if found 
      const response: IGetBookmarksResponse = {};
      if (result) {
        response.bookmarks = result.bookmarks;
        response.lastUpdated = result.lastUpdated;
      }
      return response;
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarks', req, err);
      throw err;
    }
  }

  // Returns the last updated date for the supplied sync ID
  public async getLastUpdated(id: string, req: Request): Promise<IGetLastUpdatedResponse> {
    // Before proceeding, check service is available
    this.checkServiceAvailability();

    try {
      // Query the db for the existing bookmarks data and update the last accessed date
      const result = await new Promise<IBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOneAndUpdate(
          { _id: id },
          { lastAccessed: new Date() },
          (err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      // Return the last updated date if bookmarks data found 
      const response: IGetLastUpdatedResponse = {};
      if (result) {
        response.lastUpdated = result.lastUpdated;
      }
      return response;
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getLastUpdated', req, err);
      throw err;
    }
  }

  // Returns true/false depending whether the service is currently accepting new syncs
  public async isAcceptingNewSyncs(): Promise<boolean> {
    // Check if allowNewSyncs config value enabled
    if (!this.config.status.allowNewSyncs) {
      return false;
    }

    // Check if maxSyncs config value disabled
    if (this.config.maxSyncs === 0) {
      return true;
    }

    // Check if total syncs have reached limit set in config  
    const bookmarksCount = await this.getBookmarksCount();
    return bookmarksCount < this.config.maxSyncs;
  }

  // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks data
  // Returns the last updated date
  public async updateBookmarks(id: string, bookmarksData: string, req: Request): Promise<IUpdateBookmarksResponse> {
    // Before proceeding, check service is available
    this.checkServiceAvailability();

    try {
      // Create update bookmarks payload
      const updatedBookmarks = {
        bookmarks: bookmarksData,
        lastAccessed: new Date(),
        lastUpdated: new Date()
      };

      // Commit the bookmarks payload to the db
      const result = await new Promise<IBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOneAndUpdate({ _id: id }, updatedBookmarks, (err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      // Return the last updated date if bookmarks data found and updated
      const response: IGetLastUpdatedResponse = {};
      if (result) {
        response.lastUpdated = updatedBookmarks.lastUpdated;
      }

      return response;
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
      throw err;
    }
  }

  // Returns the total number of existing bookmarks syncs
  private getBookmarksCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      BookmarksModel.count(null, (err, count) => {
        if (err) {
          this.log(LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarksCount', null, err);
          reject(err);
          return;
        }

        resolve(count);
      });
    });
  }

  // Generates a new 32 char id string
  private newSyncId(): string {
    let newId: string;

    try {
      // Create a new v4 uuid and return as an unbroken string to use for a unique id
      const bytes: any = uuid.v4(null, new Buffer(16));
      newId = new Buffer(bytes, 'base64').toString('hex');
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in BookmarksService.newSyncId', null, err);
    }

    return newId;
  }
}