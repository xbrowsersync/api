import { autobind } from 'core-decorators';
import { NextFunction, Request, Response, Router } from 'express';
import { ApiVerb } from './api';
import BaseRouter from './baseRouter';
import InfoService from './infoService';

// 
export default class InfoRouter extends BaseRouter<InfoService> {
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

  // 
  protected initRoutes() {
    this.createRoute(ApiVerb.get, '/', '^1.0.0', this.info);
  }
}