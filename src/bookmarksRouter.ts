import { Request, Response, Router, NextFunction } from 'express';
import { autobind } from 'core-decorators';
import BookmarksService from './bookmarksService';

export default class BookmarksRouter {
  public router: Router;
  private service: BookmarksService;

  constructor(bookmarksService: BookmarksService) {
    this.service = bookmarksService;

    // Configure routes
    this.router = Router();
    this.router.get('/new', this.createBookmarksSync);
    this.router.get('/:id', this.getBookmarksSync);
  }

  @autobind
  private async createBookmarksSync(req: Request, res: Response, next: NextFunction) {
    const newBookmarksSync = await this.service.createBookmarksSync(req);
    res.json(newBookmarksSync);
    return next();
  }

  @autobind
  private async getBookmarksSync(req: Request, res: Response, next: NextFunction) {
    const bookmarksSync = await this.service.getBookmarksSync(req);
    res.json(bookmarksSync);
    return next();
  }
}