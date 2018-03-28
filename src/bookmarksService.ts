import { Request } from 'express';
import * as uuid from 'node-uuid';
import { ApiError } from './api';
import BookmarksModel, { iBookmarks, iBookmarksModel } from './bookmarksModel';
import BaseService from './baseService';
import NewSyncLogsService from './newSyncLogsService';
const Config = require('./config.json');

export interface iCreateBookmarksResponse {
  id?: string,
  lastUpdated?: Date
}

export interface iGetBookmarksResponse {
  bookmarks?: string,
  lastUpdated?: Date
}

export interface iGetLastUpdatedResponse {
  lastUpdated?: Date
}

export interface iUpdateBookmarksResponse {
  lastUpdated?: Date
}

// 
export default class BookmarksService extends BaseService<NewSyncLogsService> {
  // 
  public async createBookmarks(req: Request): Promise<iCreateBookmarksResponse> {
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

    if (Config.dailyNewSyncsLimit > 0) {
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
      if (Config.log.enabled) {
        this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarks.');
      }
      throw err;
    }

    try {
      const createBookmarks = new BookmarksModel({
        _id: id,
        bookmarks: req.body.bookmarks,
        lastAccessed: new Date(),
        lastUpdated: new Date()
      } as iBookmarks);

      const newBookmarks = await new Promise<iBookmarksModel>((resolve, reject) => {
        createBookmarks.save((err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      if (Config.dailyNewSyncsLimit > 0) {
        // Add entry to new syncs log
        const newLog = await this.service.createLog(req);
      }

      // Add entry to api log file
      if (Config.log.enabled) {
        this.logger.info({ req: req }, 'New bookmarks sync created.');
      }

      // Return the new sync id and last updated datetime
      return {
        id: id,
        lastUpdated: newBookmarks.lastUpdated
      } as iCreateBookmarksResponse;
    }
    catch (err) {
      if (Config.log.enabled) {
        this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarks.');
      }
      throw err;
    }
  }

  //
  public async getBookmarks(req: Request): Promise<iGetBookmarksResponse> {
    // Check for service availability
    this.checkServiceAvailability();

    // Check sync id has been provided
    const id = this.getSyncId(req);

    try {
      const bookmarks = await new Promise<iBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOne({ _id: id }, (err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      const response: iGetBookmarksResponse = {};

      if (bookmarks) {
        response.bookmarks = bookmarks.bookmarks;
        response.lastUpdated = bookmarks.lastUpdated;
      }

      return response;
    }
    catch (err) {
      if (Config.log.enabled) {
        this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.getBookmarks.');
      }
      throw err;
    }
  }

  //
  private getBookmarksCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      BookmarksModel.count(null, (err, count) => {
        if (err) {
          if (Config.log.enabled) {
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
  public async getLastUpdated(req: Request): Promise<iGetLastUpdatedResponse> {
    // Check for service availability
    this.checkServiceAvailability();

    // Check sync id has been provided
    const id = this.getSyncId(req);

    try {
      const bookmarks = await new Promise<iBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOne({ _id: id }, (err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      const response: iGetLastUpdatedResponse = {};

      if (bookmarks) {
        response.lastUpdated = bookmarks.lastUpdated;
      }

      return response;
    }
    catch (err) {
      if (Config.log.enabled) {
        this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.getLastUpdated.');
      }
      throw err;
    }
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

  //
  public async isAcceptingNewSyncs(): Promise<boolean> {
    // Check if allowNewSyncs config value enabled
    if (!Config.status.allowNewSyncs) {
      return false;
    }

    // Check if maxSyncs config value disabled
    if (Config.maxSyncs === 0) {
      return true;
    }

    // Check if total syncs have reached limit set in config  
    const bookmarksCount = await this.getBookmarksCount();
    return bookmarksCount < Config.maxSyncs;
  }

  // Generates a new 32 char id string
  private newSyncId(): string {
    let newId: string;

    try {
      const bytes: any = uuid.v4(null, new Buffer(16));
      newId = new Buffer(bytes, 'base64').toString('hex');
    }
    catch (err) {
      if (Config.log.enabled) {
        this.logger.error({ err: err }, 'Exception occurred in BookmarksService.newSyncId.');
      }
    }

    return newId;
  }

  //
  public async updateBookmarks(req: Request): Promise<iUpdateBookmarksResponse> {
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
      const updatedBookmarks: iBookmarks = {
        bookmarks: req.body.bookmarks,
        lastAccessed: new Date(),
        lastUpdated: new Date()
      };

      const bookmarks = await new Promise<iBookmarksModel>((resolve, reject) => {
        BookmarksModel.findOneAndUpdate({ _id: id }, updatedBookmarks, (err, document) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(document);
          }
        });
      });

      const response: iGetLastUpdatedResponse = {};
      if (bookmarks) {
        response.lastUpdated = updatedBookmarks.lastUpdated;
      }

      return response;
    }
    catch (err) {
      if (Config.log.enabled) {
        this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarks.');
      }
      throw err;
    }
  }
}