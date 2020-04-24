import 'jest';
import BaseRouter from './base.router';
import { NotImplementedException, UnsupportedVersionException } from '../exception';
import { Verb } from '../server';

describe('BaseRouter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('BaseRouter: constructor should initialise routes', async () => {
    const initRoutesMock = jest.spyOn(BaseRouter.prototype, 'initRoutes').mockImplementation();
    const router = new BaseRouter(null);
    expect(router).not.toBeNull();
    expect(initRoutesMock).toBeCalled();
  });

  it('BaseRouter: initRoutes should throw NotImplementedException', async () => {
    expect(() => {
      new BaseRouter(null);
    }).toThrow(NotImplementedException);
  });

  it('BaseRouter: unsupportedVersion should throw UnsupportedVersionException', async () => {
    const initRoutesMock = jest.spyOn(BaseRouter.prototype, 'initRoutes').mockImplementation();
    const router = new BaseRouter(null);
    expect(() => {
      router.unsupportedVersion();
    }).toThrow(UnsupportedVersionException);
  });

  it('BaseRouter: should create a route with the provided verb, path and version mappings', async () => {
    jest.spyOn(BaseRouter.prototype, 'initRoutes').mockImplementation();
    const router = new BaseRouter(null);
    router.createRoute(Verb.get, '/', { '^1.0.0': () => { } });
    expect(router._router[Verb.get]).toStrictEqual(expect.any(Function));
  });
});