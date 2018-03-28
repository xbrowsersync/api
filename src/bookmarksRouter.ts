import { Request, Response, Router, NextFunction } from 'express';
import { autobind } from 'core-decorators';
import { ApiVerb } from './api';
import BookmarksService from './bookmarksService';
import BaseRouter from './baseRouter';

// 
export default class BookmarksRouter extends BaseRouter<BookmarksService> {
  // 
  protected initRoutes() {
    this.createRoute(ApiVerb.post, '/', '^1.0.0', this.createBookmarks);
    this.createRoute(ApiVerb.get, '/:id', '^1.0.0', this.getBookmarks);
    this.createRoute(ApiVerb.put, '/:id', '^1.0.0', this.updateBookmarks);
    this.createRoute(ApiVerb.get, '/:id/lastUpdated', '^1.0.0', this.getLastUpdated);
  }

  // 
  @autobind
  private async createBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const newBookmarksSync = await this.service.createBookmarks(req);
      res.json(newBookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }

  // 
  @autobind
  private async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const bookmarksSync = await this.service.getBookmarks(req);
      res.json(bookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }

  // 
  @autobind
  private async getLastUpdated(req: Request, res: Response, next: NextFunction) {
    try {
      const bookmarksSync = await this.service.getLastUpdated(req);
      res.json(bookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }

  // 
  @autobind
  private async updateBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const bookmarksSync = await this.service.updateBookmarks(req);
      res.json(bookmarksSync);
    }
    catch (err) {
      next(err);
    }
  }
}