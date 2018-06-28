import { autobind } from 'core-decorators';
import { Application, Router } from 'express';

import { NotImplementedException, UnsupportedVersionException } from '../core/exception';
import { ApiVerb } from '../core/server';

// Interface for router implementations
export interface IApiRouter {
  initRoutes(): void;
}

// Base class for router implementations
// Implements the routes that are served by the api 
export default class BaseRouter<T> implements IApiRouter {
  protected router: Router;
  private routesVersioning = require('express-routes-versioning')();  

  constructor(protected app: Application, protected service?: T) {
    // Configure routes
    this.router = Router();
    this.initRoutes();
  }

  // Initialises the routes for this router implementation
  public initRoutes(): void {
    throw new NotImplementedException();
  }

  // Adds a new route to this router implementation
  @autobind
  protected createRoute(verb: ApiVerb, path: string, versionMappings: any): void {
    this.router[verb](path, this.routesVersioning(versionMappings, this.unsupportedVersion));
  }

  // Throws an error for when a requested api version is not supported
  private unsupportedVersion(): void {
    throw new UnsupportedVersionException();
  }
}