import { autobind } from 'core-decorators';
import { Application, Router } from 'express';
import { Verb } from '../common/enums';
import { NotImplementedException, UnsupportedVersionException } from '../exception';

// Interface for router implementations
export interface IApiRouter {
  initRoutes(): void;
}

// Base class for router implementations
// Implements the routes that are served by the api
export class ApiRouter<T> implements IApiRouter {
  _router: Router;
  _routesVersioning = require('express-routes-versioning')();

  constructor(protected app: Application, protected service?: T) {
    // Configure routes
    this._router = Router();
    this.initRoutes();
  }

  // Initialises the routes for this router implementation
  initRoutes(): void {
    throw new NotImplementedException();
  }

  // Adds a new route to this router implementation
  @autobind
  createRoute(verb: Verb, path: string, versionMappings: any): void {
    this._router[verb](path, this._routesVersioning(versionMappings, this.unsupportedVersion));
  }

  // Throws an error for when a requested api version is not supported
  unsupportedVersion(): void {
    throw new UnsupportedVersionException();
  }
}
