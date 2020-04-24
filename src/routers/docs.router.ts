import * as express from 'express';
import * as path from 'path';
import * as Config from '../config';
import BaseRouter, { IApiRouter } from '../routers/base.router';

export const relativePathToDocs = '../docs';

// Implementation of routes for API documentation
export default class DocsRouter extends BaseRouter<void> implements IApiRouter {
  // Initialises the routes for this router implementation
  initRoutes(): void {
    this.app.use(Config.get().server.relativePath, express.static(path.join(__dirname, relativePathToDocs)));
  }
}