import 'jest';
import { Request, Response } from 'express';
import { Verb } from '../common/enums';
import * as Config from '../config';
import { InfoRouter } from './info.router';

jest.mock('express-routes-versioning', () => {
  return () => {
    return () => {};
  };
});

describe('InfoRouter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initRoutes: should configure app with base info route', async () => {
    const relativePathTest = '/';
    const configSettingsTest: Config.IConfigSettings = {
      server: {
        relativePath: relativePathTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const initRoutesSpy = jest.spyOn(InfoRouter.prototype, 'initRoutes');
    const useMock = jest.fn().mockImplementation();
    const app: any = {
      use: useMock,
    };
    jest.spyOn(InfoRouter.prototype, 'createRoute').mockImplementation();
    const infoRouter = new InfoRouter(app);
    expect(initRoutesSpy).toBeCalled();
    expect(useMock).toBeCalledWith(`${relativePathTest}info`, expect.any(Function));
  });

  it('initRoutes: should create root info route', async () => {
    const initRoutesSpy = jest.spyOn(InfoRouter.prototype, 'initRoutes');
    const app: any = {
      use: jest.fn(),
    };
    const createRouteMock = jest.spyOn(InfoRouter.prototype, 'createRoute').mockImplementation();
    const infoRouter = new InfoRouter(app);
    expect(initRoutesSpy).toBeCalled();
    expect(createRouteMock).toBeCalledWith(Verb.get, '/', { '^1.0.0': expect.any(Function) });
  });

  it('getInfo: should call service getInfo function and return the result in the response', async () => {
    jest.spyOn(InfoRouter.prototype, 'initRoutes').mockImplementation();
    const getInfoMockResult = 'test';
    const getInfoMock = jest.fn().mockImplementation(() => {
      return Promise.resolve(getInfoMockResult);
    });
    const serviceTest = {
      getInfo: getInfoMock,
    };
    const router = new InfoRouter(null, serviceTest as any);
    const req: Partial<Request> = {};
    const sendMock = jest.fn();
    const res: Partial<Response> = {
      send: sendMock,
    };
    const next = jest.fn();
    await router.getInfo(req as Request, res as Response, next);
    expect(getInfoMock).toBeCalledWith(req);
    expect(sendMock).toBeCalledWith(getInfoMockResult);
  });

  it('getInfo: should call next with error when error encountered', async () => {
    jest.spyOn(InfoRouter.prototype, 'initRoutes').mockImplementation();
    const errorTest = new Error();
    const getInfoMock = jest.fn().mockImplementation(() => {
      throw errorTest;
    });
    const serviceTest = {
      getInfo: getInfoMock,
    };
    const router = new InfoRouter(null, serviceTest as any);
    const req: Partial<Request> = {};
    const sendMock = jest.fn();
    const res: Partial<Response> = {
      send: sendMock,
    };
    const next = jest.fn();
    await router.getInfo(req as Request, res as Response, next);
    expect(next).toBeCalledWith(errorTest);
  });
});
