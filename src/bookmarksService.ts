import { Request } from 'express';
import * as bunyan from 'bunyan';
import * as uuid from 'node-uuid';
import BookmarksModel, { iBookmarks, iBookmarksModel } from './bookmarksModel';

export interface iCreateBookmarksSyncResponse {
  id: string,
  lastUpdated: Date
}

export interface iGetBookmarksSyncResponse {
  bookmarks: string,
  lastUpdated: Date
}

// 
export default class BookmarksService {
  private config = require('./config.json');
  private logger: bunyan;

  constructor(logger: bunyan) {
    this.logger = logger;
  }

  //
  public createBookmarksSync(req: Request): Promise<iCreateBookmarksSyncResponse> {
    return new Promise((resolve, reject) => {
      const id = this.newBookmarksSyncId();
      if (!id) {
        const err = new Error('Bookmarks sync ID cannot be null.');
        this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarksSync.');
        return Promise.reject(err);
      }

      const newBookmarksSync = new BookmarksModel({
        _id: id,
        bookmarks: 'asdasd',
        lastAccessed: new Date(),
        lastUpdated: new Date()
      } as iBookmarks);
      
      newBookmarksSync.save((err, newItem) => {
        if (err) {
          this.logger.error({ req: req, err: err }, 'Exception occurred in BookmarksService.createBookmarksSync.');
          reject(err);
          return;
        }

        resolve({
          id: id,
          lastUpdated: newItem.lastUpdated
        } as iCreateBookmarksSyncResponse);
      });
    });
  }

  //
  public getBookmarksSync(req: Request): Promise<iGetBookmarksSyncResponse> {
    return new Promise((resolve, reject) => {
      const id = req.params.id;
      if (!id) {
        // TODO: return error { "code": "MissingParameter", "message": "No bookmarks provided" }
      }
      
      BookmarksModel.findOne({ _id: id }, (err, bookmarksSync) => {
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
          } as iGetBookmarksSyncResponse);
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
  public async isAcceptingNewSyncs(): Promise<boolean> {
    // Check config variable first
    if (!this.config.status.allowNewSyncs) {
      return Promise.resolve(false);
    }

    // Check if total syncs have reached limit set in config  
    const totalBookmarksSyncs = await this.getTotalBookmarksSyncs();
    return totalBookmarksSyncs < this.config.maxSyncs;
  }

  //
  private getTotalBookmarksSyncs(): Promise<number> {
    return new Promise((resolve, reject) => {
      BookmarksModel.count(null, (err, count) => {
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
  private newBookmarksSyncId(): string {
    let newId: string;

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