import { autobind } from 'core-decorators';
import { NextFunction, Request, Response, Router } from 'express';
import BaseRouter from './baseRouter';
import InfoService from './infoService';
import { ApiVerb } from './server';

// Implementation of routes for service info operations
export default class InfoRouter extends BaseRouter<InfoService> {
  // Initialises the routes for this router implementation
  protected initRoutes() {
    this.createRoute(ApiVerb.get, '/', { '^1.0.0': this.getInfo });
  }

  // Gets service info such as status, version, etc
  @autobind
  private async getInfo(req: Request, res: Response, next: NextFunction) {
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