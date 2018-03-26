import { Request, Response, Router, NextFunction } from 'express';
import { autobind } from 'core-decorators';
import InfoService from './infoService';

export default class InfoRouter {
  public router: Router;
  private service: InfoService;

  constructor(infoService: InfoService) {
    this.service = infoService;

    // Configure routes
    this.router = Router();
    this.router.get('/', this.info);
  }

  @autobind
  public async info(req: Request, res: Response, next: NextFunction) {
    const serviceInfo = await this.service.getInfo(req);
    res.send(serviceInfo);
    return next();
  }
}