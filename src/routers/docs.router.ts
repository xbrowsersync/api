import express from 'express';
import path from 'path';
import * as Config from '../config';
import { ApiRouter, IApiRouter } from './api.router';

export const relativePathToDocs = '../docs';

// Implementation of routes for API documentation
export class DocsRouter extends ApiRouter<void> implements IApiRouter {
  // Initialises the routes for this router implementation
  initRoutes(): void {
    this.app.get('/favicon.ico', (req, res) => res.status(204));

    this.app.use(Config.get().server.relativePath, express.static(path.join(__dirname, relativePathToDocs)));
  }
}
