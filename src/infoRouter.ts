import { Request, Response, Router, NextFunction } from 'express';
import { autobind } from 'core-decorators';
import { ApiVerb } from './api';
import BaseRouter from './baseRouter';
import InfoService from './infoService';

// 
export default class InfoRouter extends BaseRouter<InfoService> {
  // 
  protected initRoutes() {
    this.createRoute(ApiVerb.get, '/', '^1.0.0', this.info);
  }

  // 
  @autobind
  public async info(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceInfo = await this.service.getInfo(req);
      res.send(serviceInfo);
    }
    catch (err) {
      next(err);
    }
  }
}