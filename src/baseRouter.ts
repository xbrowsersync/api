import { autobind } from 'core-decorators';
import { NextFunction, Request, Response, Router } from 'express';
import { ApiError, ApiVerb } from './api';

// 
export default class BaseRouter<T> {
  public router: Router;
  protected service: T;
  private routesVersioning = require('express-routes-versioning')();  

  constructor(service: T) {
    this.service = service;

    // Configure routes
    this.router = Router();
    this.initRoutes();
  }

  //
  @autobind
  protected createRoute(verb: ApiVerb, path: string, version: string, routeMethod: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    const options = {};
    options[version] = routeMethod;
    this.router[verb](path, this.routesVersioning(options, this.unsupportedVersion));
  }

  // 
  protected initRoutes() {
    const err = new Error();
    err.name = ApiError.NotImplementedError;
    throw err;
  }

  // 
  private unsupportedVersion(req: Request, res: Response, next: NextFunction) {
    const err = new Error();
    err.name = ApiError.UnsupportedVersionError;
    throw err;
  }
}