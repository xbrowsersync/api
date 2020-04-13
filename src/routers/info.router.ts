import { autobind } from 'core-decorators';
import { NextFunction, Request, Response } from 'express';
import Config from '../config';
import { ApiVerb } from '../server';
import BaseRouter, { IApiRouter } from '../routers/base.router';
import InfoService from '../services/info.service';

// Implementation of routes for service info operations
export default class InfoRouter extends BaseRouter<InfoService> implements IApiRouter {
  // Initialises the routes for this router implementation
  public initRoutes(): void {
    this.app.use(`${Config.get().server.relativePath}info`, this.router);
    this.createRoute(ApiVerb.get, '/', { '^1.0.0': this.getInfo });
  }

  // Gets service info such as status, version, etc
  @autobind
  private async getInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Call service method to get service info and return response as json
      const serviceInfo = await this.service.getInfo(req);
      res.send(serviceInfo);
    }
    catch (err) {
      next(err);
    }
  }
}