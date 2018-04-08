import { autobind } from 'core-decorators';
import { NextFunction, Request, Response, Router } from 'express';
import { NotImplementedException, UnsupportedVersionException } from './exception';
import { ApiVerb } from './server';

// Base class for router implementations
// Implements the routes that are served by the api 
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

  // Adds a new route to this router implementation
  @autobind
  protected createRoute(verb: ApiVerb, path: string, version: string, routeMethod: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    const options = {};
    options[version] = routeMethod;
    this.router[verb](path, this.routesVersioning(options, this.unsupportedVersion));
  }

  // Initialises the routes for this router implementation
  protected initRoutes() {
    throw new NotImplementedException();
  }

  // Throws an error for when a requested api version is not supported
  private unsupportedVersion(req: Request, res: Response, next: NextFunction) {
    throw new UnsupportedVersionException();
  }
}