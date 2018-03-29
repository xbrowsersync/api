import { Request } from 'express';
import * as uuid from 'uuid';
import { ApiError } from './api';
import BaseService from './baseService';
import BookmarksModel, { IBookmarks, IBookmarksModel } from './bookmarksModel';
import NewSyncLogsService from './newSyncLogsService';

export interface ICreateBookmarksResponse {
  id?: string,
  lastUpdated?: Date
}

export interface IGetBookmarksResponse {
  bookmarks?: string,
  lastUpdated?: Date
}

export interface IGetLastUpdatedResponse {
  lastUpdated?: Date
}

export interface IUpdateBookmarksResponse {
  lastUpdated?: Date
}

// 
export default class BookmarksService extends BaseService<NewSyncLogsService> {
  // 
  public async createBookmarks(req: Request): Promise<ICreateBookmarksResponse> {
    // Check for service availability
    this.checkServiceAvailability();

    // Check bookmarks data has been provided
    if (!req.body.bookmarks) {
      const err = new Error();
      err.name = ApiError.BookmarksDataNotFoundError;
      throw err;
    }

    // Check service is accepting new syncs
    const isAcceptingNewSyncs = await this.isAcceptingNewSyncs();
    if (!isAcceptingNewSyncs) {
      const err = new Error();
      err.name = ApiError.NewSyncsForbiddenError;
      throw err;
    }

    if (this.config.dailyNewSyncsLimit > 0) {
      // Check if daily new syncs limit has been hit
      const newSyncsLimitHit = await this.service.newSyncsLimitHit(req);
      if (newSyncsLimitHit) {
        const err = new Error();
        err.name = ApiError.NewSyncsLimitExceededError;
        throw err;
      }
    }

    // Get a new sync id
    const id = this.newSyncId();
    if (!id) {
      const err = new Error();
      err.name = ApiError.SyncIdNotFoundError;
      if (this.config.log.enabled) {
        this.logger.error({ req, err }, 'Exception occurred in BookmarksService.createBookmarks.');
      }
      throw err;
    }

    try {
      const newBookmarks: IBookmarks = {
        _id: id,
        bookmarks: req.body.bookmarks,
        lastAccessed: new Date(),
        lastUpdated: new Date()
      };
      const bookmarksModel = new BookmarksModel(newBookmarks);

      const response = await new Promise<IBookmarksModel>((resolve, reject) => {
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
        const newLog = await this.service.createLog(req);
      }

      // Add entry to api log file
      if (this.config.log.enabled) {
        this.logger.info({ req }, 'New bookmarks sync created.');
      }

      // Return the new sync id and last updated datetime
      const returnObj: ICreateBookmarksResponse = {
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
  }

  //
  public async getBookmarks(req: Request): Promise<IGetBookmarksResponse> {
    // Check for service availability
    this.checkServiceAvailability();

    // Check sync id has been provided
    const id = this.getSyncId(req);

    try {
      const bookmarks = await new Promise<IBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOne({ _id: id }, (err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      const response: IGetBookmarksResponse = {};

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
  }

  //
  public async getLastUpdated(req: Request): Promise<IGetLastUpdatedResponse> {
    // Check for service availability
    this.checkServiceAvailability();

    // Check sync id has been provided
    const id = this.getSyncId(req);

    try {
      const bookmarks = await new Promise<IBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOne({ _id: id }, (err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      const response: IGetLastUpdatedResponse = {};

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
  }

  //
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

  //
  public async updateBookmarks(req: Request): Promise<IUpdateBookmarksResponse> {
    // Check for service availability
    this.checkServiceAvailability();

    // Check bookmarks data has been provided
    if (!req.body.bookmarks) {
      const err = new Error();
      err.name = ApiError.BookmarksDataNotFoundError;
      throw err;
    }

    // Check sync id has been provided
    const id = this.getSyncId(req);

    try {
      const updatedBookmarks: IBookmarks = {
        _id: undefined,
        bookmarks: req.body.bookmarks,
        lastAccessed: new Date(),
        lastUpdated: new Date()
      };

      const bookmarks = await new Promise<IBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOneAndUpdate({ _id: id }, updatedBookmarks, (err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      const response: IGetLastUpdatedResponse = {};
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
  }

  //
  private getBookmarksCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      BookmarksModel.count(null, (err, count) => {
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
  private getSyncId(req: Request): string {
    const id = req.params.id;
    if (!id) {
      const err = new Error();
      err.name = ApiError.SyncIdNotFoundError;
      throw err;
    }

    return id;
  }

  // Generates a new 32 char id string
  private newSyncId(): string {
    let newId: string;

    try {
      const bytes: any = uuid.v4(null, new Buffer(16));
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