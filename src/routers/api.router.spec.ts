import 'jest';
import { Verb } from '../common/enums';
import { NotImplementedException, UnsupportedVersionException } from '../exception';
import { ApiRouter } from './api.router';

jest.mock('express', () => {
  return {
    Router: () => {
      return {
        get: jest.fn(),
      };
    },
  };
});
jest.mock('express-routes-versioning', () => {
  return () => {
    return () => {};
  };
});

describe('ApiRouter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ApiRouter: constructor should initialise routes', async () => {
    const initRoutesMock = jest.spyOn(ApiRouter.prototype, 'initRoutes').mockImplementation();
    const router = new ApiRouter(null);
    expect(router).not.toBeNull();
    expect(initRoutesMock).toBeCalled();
  });

  it('ApiRouter: initRoutes should throw NotImplementedException', async () => {
    expect(() => {
      const apiRouter = new ApiRouter(null);
    }).toThrow(NotImplementedException);
  });

  it('ApiRouter: unsupportedVersion should throw UnsupportedVersionException', async () => {
    const initRoutesMock = jest.spyOn(ApiRouter.prototype, 'initRoutes').mockImplementation();
    const router = new ApiRouter(null);
    expect(() => {
      router.unsupportedVersion();
    }).toThrow(UnsupportedVersionException);
  });

  it('ApiRouter: should create a route with the provided verb, path and version mappings', async () => {
    jest.spyOn(ApiRouter.prototype, 'initRoutes').mockImplementation();
    const router = new ApiRouter(null);
    router.createRoute(Verb.get, '/', { '^1.0.0': () => {} });
    expect(router._router[Verb.get]).toStrictEqual(expect.any(Function));
  });
});
