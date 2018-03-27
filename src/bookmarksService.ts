import { Request } from 'express';
import * as bunyan from 'bunyan';
import * as uuid from 'node-uuid';
import BookmarksModel, { iBookmarks, iBookmarksModel } from './bookmarksModel';
import NewSyncLogsService from './newSyncLogsService';

export interface iCreateBookmarksResponse {
  id: string,
  lastUpdated: Date
}

export interface iGetBookmarksResponse {
  bookmarks?: string,
  lastUpdated?: Date
}

// 
export default class BookmarksService {
  private config = require('./config.json');
  private logger: bunyan;
  private newSyncLogsService: NewSyncLogsService;

  constructor(newSyncLogsService: NewSyncLogsService, logger: bunyan) {
    this.newSyncLogsService = newSyncLogsService;
    this.logger = logger;
  }

  // 
  private checkServiceAvailability(): void {
    if (this.config.status.offline) {
      throw new Error('Service not available.');
    }
  }

  // 
  public async createBookmarks(req: Request): Promise<iCreateBookmarksResponse> {
    // Check for service availability
    this.checkServiceAvailability();

    // Check bookmarks data has been provided
    if (!req.body.bookmarks) {
      throw new Error('Bookmarks data not found');
    }

    // Check service is accepting new syncs
    const isAcceptingNewSyncs = await this.isAcceptingNewSyncs();
    if (!isAcceptingNewSyncs) {
      throw new Error('Not accepting new syncs');
    }

    if (this.config.dailyNewSyncsLimit > 0) {
      // Check if daily new syncs limit has been hit
      const newSyncsLimitHit = await this.newSyncLogsService.newSyncsLimitHit(req);
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

      if (this.config.dailyNewSyncsLimit > 0) {
        // Add entry to new syncs log
        const newLog = await this.newSyncLogsService.createLog(req);
      }

      // Add entry to api log file
      if (this.config.log.enabled) {
        this.logger.info({ req: req }, 'New bookmarks sync created.');
      }

      // Return the new sync id and last updated datetime
      return {
        id: id,
        lastUpdated: newBookmarks.lastUpdated
      } as iCreateBookmarksResponse;
    }
    catch (err) {
      if (this.config.log.enabled) {
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
    const id = req.params.id;
    if (!id) {
      throw new Error('Sync ID not found');
    }

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
      if (this.config.log.enabled) {
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

  // Generates a new 32 char id string
  private newSyncId(): string {
    let newId: string;

    try {
      const bytes: any = uuid.v4(null, new Buffer(16));
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