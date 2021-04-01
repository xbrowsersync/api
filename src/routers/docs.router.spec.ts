import 'jest';
import express from 'express';
import path from 'path';
import * as Config from '../config';
import { DocsRouter, relativePathToDocs } from './docs.router';

jest.mock('express-routes-versioning');

describe('DocsRouter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initRoutes: should provide app with docs route', async () => {
    const relativePathTest = '/';
    const configSettingsTest: Config.IConfigSettings = {
      server: {
        relativePath: relativePathTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const initRoutesSpy = jest.spyOn(DocsRouter.prototype, 'initRoutes');
    jest.spyOn(path, 'join').mockImplementation((...args): any => {
      return args[1];
    });
    let relativePath;
    const staticMock = jest.spyOn(express, 'static').mockImplementation((...args): any => {
      relativePath = args[0];
      return relativePath;
    });
    let routePath;
    let handler;
    const useMock = jest.fn().mockImplementation((...args) => {
      routePath = args[0];
      handler = args[1];
    });
    const app: any = {
      get: jest.fn(),
      use: useMock,
    };
    const router = new DocsRouter(app);
    expect(router).not.toBeNull();
    expect(initRoutesSpy).toBeCalled();
    expect(useMock).toBeCalled();
    expect(routePath).toStrictEqual(relativePathTest);
    expect(staticMock).toBeCalled();
    expect(relativePath).toStrictEqual(relativePathToDocs);
    expect(handler).toStrictEqual(relativePathToDocs);
  });
});
