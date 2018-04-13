import { autobind } from 'core-decorators';
import { NextFunction, Request, Response, Router } from 'express';
import BaseRouter from './baseRouter';
import BookmarksService from './bookmarksService';
import DB from './db';
import { BookmarksDataNotFoundException, InvalidSyncIdException } from './exception';
import { ApiVerb } from './server';

// Implementation of routes for bookmarks operations
export default class BookmarksRouter extends BaseRouter<BookmarksService> {
  // Initialises the routes for this router implementation
  protected initRoutes() {
    this.createRoute(ApiVerb.post, '/', '^1.0.0', this.createBookmarks);
    this.createRoute(ApiVerb.get, '/:id', '^1.0.0', this.getBookmarks);
    this.createRoute(ApiVerb.put, '/:id', '^1.0.0', this.updateBookmarks);
    this.createRoute(ApiVerb.get, '/:id/lastUpdated', '^1.0.0', this.getLastUpdated);
  }

  // Creates a new bookmarks sync and returns new sync ID
  @autobind
  private async createBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      // Get posted bookmarks data
      const bookmarksData = this.getBookmarksData(req);

      // Call service method to create new bookmarks sync and return response as json
      const newBookmarksSync = await this.service.createBookmarks(bookmarksData, req);
      res.json(newBookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }

  // Retrieves an existing bookmarks sync with a provided sync ID
  @autobind
  private async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      // Check sync id has been provided
      const id = this.getSyncId(req);

      // Call service method to retrieve bookmarks data and return response as json
      const bookmarksSync = await this.service.getBookmarks(id, req);
      res.json(bookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }

  // Retrieves posted bookmarks data from request body
  private getBookmarksData(req: Request): string {
    if (!req.body.bookmarks) {
      throw new BookmarksDataNotFoundException;
    }

    return req.body.bookmarks;
  }

  // Retrieves last updated date for a given bookmarks sync ID
  @autobind
  private async getLastUpdated(req: Request, res: Response, next: NextFunction) {
    try {
      // Check sync id has been provided
      const id = this.getSyncId(req);

      // Call service method to get bookmarks last updated date and return response as json
      const bookmarksSync = await this.service.getLastUpdated(id, req);
      res.json(bookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }

  // Retrieves the bookmarks sync ID from the request query string parameters
  private getSyncId(req: Request): string {
    const id = req.params.id;

    // Check id is valid
    DB.idIsValid(id);

    return id;
  }

  // Updates bookmarks data for a given bookmarks sync ID
  @autobind
  private async updateBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      // Check sync id has been provided
      const id = this.getSyncId(req);

      // Get posted bookmarks data
      const bookmarksData = this.getBookmarksData(req);

      // Call service method to update bookmarks data and return response as json
      const bookmarksSync = await this.service.updateBookmarks(id, bookmarksData, req);
      res.json(bookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }
}