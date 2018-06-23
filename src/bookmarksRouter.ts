import { autobind } from 'core-decorators';
import { NextFunction, Request, Response, Router } from 'express';
import BaseRouter from './baseRouter';
import BookmarksService from './bookmarksService';
import DB from './db';
import { RequiredDataNotFoundException } from './exception';
import { ApiVerb } from './server';

// Implementation of routes for bookmarks operations
export default class BookmarksRouter extends BaseRouter<BookmarksService> {
  // Initialises the routes for this router implementation
  protected initRoutes() {
    this.createRoute(ApiVerb.post, '/', {
      '~1.0.0': this.createBookmarks_v1,
      '~1.1.3': this.createBookmarks_v2
    });
    this.createRoute(ApiVerb.get, '/:id', { '^1.0.0': this.getBookmarks });
    this.createRoute(ApiVerb.put, '/:id', {
      '~1.0.0': this.updateBookmarks_v1,
      '~1.1.3': this.updateBookmarks_v2
    });
    this.createRoute(ApiVerb.get, '/:id/lastUpdated', { '^1.0.0': this.getLastUpdated });
    this.createRoute(ApiVerb.get, '/:id/version', { '~1.1.3': this.getVersion });
  }

  // Creates a new bookmarks sync and returns new sync ID
  @autobind
  private async createBookmarks_v1(req: Request, res: Response, next: NextFunction) {
    try {
      // Get posted bookmarks data
      const bookmarksData = this.getBookmarksData(req);
      if (bookmarksData === '') {
        throw new RequiredDataNotFoundException;
      }

      // Call service method to create new bookmarks sync and return response as json
      const newSync = await this.service.createBookmarks_v1(bookmarksData, req);
      res.json(newSync);
    }
    catch (err) {
      next(err);
    }
  }

  // Creates an empty sync using sync version and returns new sync ID
  @autobind
  private async createBookmarks_v2(req: Request, res: Response, next: NextFunction) {
    try {
      // Get posted sync version
      const syncVersion = req.body.version;
      if (!syncVersion) {
        throw new RequiredDataNotFoundException;
      }
      
      // Call service method to create new sync and return response as json
      const newSync = await this.service.createBookmarks_v2(req.body.version, req);
      res.json(newSync);
    }
    catch (err) {
      next(err);
    }
  }

  // Retrieves an existing sync with a provided sync ID
  @autobind
  private async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      // Check sync id has been provided
      const id = this.getSyncId(req);

      // Call service method to retrieve bookmarks data and return response as json
      const bookmarks = await this.service.getBookmarks(id, req);
      res.json(bookmarks);
    }
    catch (err) {
      next(err);
    }
  }

  // Retrieves posted bookmarks data from request body
  private getBookmarksData(req: Request): string {
    return req.body.bookmarks || '';
  }

  // Retrieves last updated date for a given sync ID
  @autobind
  private async getLastUpdated(req: Request, res: Response, next: NextFunction) {
    try {
      // Check sync id has been provided
      const id = this.getSyncId(req);

      // Call service method to get bookmarks last updated date and return response as json
      const lastUpdated = await this.service.getLastUpdated(id, req);
      res.json(lastUpdated);
    }
    catch (err) {
      next(err);
    }
  }

  // Retrieves the sync ID from the request query string parameters
  private getSyncId(req: Request): string {
    const id = req.params.id;

    // Check id is valid
    DB.idIsValid(id);

    return id;
  }

  // Retrieves sync version for a given sync ID
  @autobind
  private async getVersion(req: Request, res: Response, next: NextFunction) {
    try {
      // Check sync id has been provided
      const id = this.getSyncId(req);

      // Call service method to get sync version and return response as json
      const syncVersion = await this.service.getVersion(id, req);
      res.json(syncVersion);
    }
    catch (err) {
      next(err);
    }
  }

  // Updates bookmarks data for a given bookmarks sync ID
  @autobind
  private async updateBookmarks_v1(req: Request, res: Response, next: NextFunction) {
    try {
      // Check sync id has been provided
      const id = this.getSyncId(req);

      // Get posted bookmarks data
      const bookmarksData = this.getBookmarksData(req);
      if (bookmarksData === '') {
        throw new RequiredDataNotFoundException;
      }

      // Call service method to update bookmarks data and return response as json
      const bookmarksSync = await this.service.updateBookmarks_v1(id, bookmarksData, req);
      res.json(bookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }

  // Updates bookmarks sync bookmarks data and sync version for a given bookmarks sync ID
  @autobind
  private async updateBookmarks_v2(req: Request, res: Response, next: NextFunction) {
    try {
      // Check sync id has been provided
      const id = this.getSyncId(req);

      // Get posted bookmarks data
      const bookmarksData = this.getBookmarksData(req);
      if (bookmarksData === '') {
        throw new RequiredDataNotFoundException;
      }

      // Call service method to update bookmarks data and return response as json
      const bookmarksSync = await this.service.updateBookmarks_v2(id, bookmarksData, req.body.version, req);
      res.json(bookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }
}