import { autobind } from 'core-decorators';
import { NextFunction, Request, Response } from 'express';
import { Verb } from '../common/enums';
import * as Config from '../config';
import { InfoService } from '../services/info.service';
import { ApiRouter, IApiRouter } from './api.router';

// Implementation of routes for service info operations
export class InfoRouter extends ApiRouter<InfoService> implements IApiRouter {
  // Initialises the routes for this router implementation
  initRoutes(): void {
    this.app.use(`${Config.get().server.relativePath}info`, this._router);
    this.createRoute(Verb.get, '/', { '^1.0.0': this.getInfo });
  }

  // Gets service info such as status, version, etc
  @autobind
  async getInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Call service method to get service info and return response as json
      const serviceInfo = await this.service.getInfo(req);
      res.send(serviceInfo);
    } catch (err) {
      next(err);
    }
  }
}
