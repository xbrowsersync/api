import { Request, Response, Router, NextFunction } from 'express';
import { autobind } from 'core-decorators';
import BookmarksService from './bookmarksService';

// 
export default class BookmarksRouter {
  public router: Router;
  private service: BookmarksService;

  constructor(bookmarksService: BookmarksService) {
    this.service = bookmarksService;

    // Configure routes
    // TODO: Add function for checking if server offline for each route
    this.router = Router();
    this.router.post('/', this.createBookmarks);
    this.router.get('/:id', this.getBookmarks);
    this.router.put('/:id', this.updateBookmarks);
    this.router.get('/:id/lastUpdated', this.getLastUpdated);
  }

  // 
  @autobind
  private async createBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const newBookmarksSync = await this.service.createBookmarks(req);
      res.json(newBookmarksSync);
    }
    catch (err) {
      res.json({
        code: 'MissingParameter',
        message: err.message
      });
    }

    next();
  }

  // 
  @autobind
  private async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const bookmarksSync = await this.service.getBookmarks(req);
      res.json(bookmarksSync);
    }
    catch (err) {
      res.json({
        code: 'MissingParameter',
        message: err.message
      });
    }

    next();
  }

  // 
  @autobind
  private async getLastUpdated(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement
  }

  // 
  @autobind
  private async updateBookmarks(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement
  }
}