import 'jest';
import { Request, Response } from 'express';
import { Verb } from '../common/enums';
import * as Config from '../config';
import { InvalidSyncIdException, RequiredDataNotFoundException } from '../exception';
import * as Uuid from '../uuid';
import { BookmarksRouter } from './bookmarks.router';

jest.mock('express-routes-versioning', () => {
  return () => {
    return () => {};
  };
});

describe('InfoRouter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initRoutes: should configure app with base bookmarks route', async () => {
    const relativePathTest = '/';
    const configSettingsTest: Config.IConfigSettings = {
      server: {
        relativePath: relativePathTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const initRoutesSpy = jest.spyOn(BookmarksRouter.prototype, 'initRoutes');
    const useMock = jest.fn().mockImplementation();
    const app: any = {
      use: useMock,
    };
    jest.spyOn(BookmarksRouter.prototype, 'createRoute').mockImplementation();
    const bookmarksRouter = new BookmarksRouter(app);
    expect(initRoutesSpy).toHaveBeenCalled();
    expect(useMock).toHaveBeenCalledWith(`${relativePathTest}bookmarks`, expect.any(Function));
  });

  it('initRoutes: should create root bookmarks route', async () => {
    const initRoutesSpy = jest.spyOn(BookmarksRouter.prototype, 'initRoutes');
    const app: any = {
      use: jest.fn(),
    };
    const createRouteMock = jest.spyOn(BookmarksRouter.prototype, 'createRoute').mockImplementation();
    const bookmarksRouter = new BookmarksRouter(app);
    expect(initRoutesSpy).toHaveBeenCalled();
    expect(createRouteMock).toHaveBeenCalledWith(Verb.post, '/', {
      '~1.0.0': expect.any(Function),
      '^1.1.3': expect.any(Function),
    });
  });

  it('initRoutes: should create bookmarks id routes', async () => {
    const initRoutesSpy = jest.spyOn(BookmarksRouter.prototype, 'initRoutes');
    const app: any = {
      use: jest.fn(),
    };
    const createRouteMock = jest.spyOn(BookmarksRouter.prototype, 'createRoute').mockImplementation();
    const bookmarksRouter = new BookmarksRouter(app);
    expect(initRoutesSpy).toHaveBeenCalled();
    expect(createRouteMock).toHaveBeenCalledWith(Verb.get, '/:id', { '^1.0.0': expect.any(Function) });
    expect(createRouteMock).toHaveBeenCalledWith(Verb.put, '/:id', {
      '~1.0.0': expect.any(Function),
      '^1.1.3': expect.any(Function),
    });
  });

  it('initRoutes: should create bookmarks lastupdated route', async () => {
    const initRoutesSpy = jest.spyOn(BookmarksRouter.prototype, 'initRoutes');
    const app: any = {
      use: jest.fn(),
    };
    const createRouteMock = jest.spyOn(BookmarksRouter.prototype, 'createRoute').mockImplementation();
    const bookmarksRouter = new BookmarksRouter(app);
    expect(initRoutesSpy).toHaveBeenCalled();
    expect(createRouteMock).toHaveBeenCalledWith(Verb.get, '/:id/lastUpdated', { '^1.0.0': expect.any(Function) });
  });

  it('initRoutes: should create bookmarks version route', async () => {
    const initRoutesSpy = jest.spyOn(BookmarksRouter.prototype, 'initRoutes');
    const app: any = {
      use: jest.fn(),
    };
    const createRouteMock = jest.spyOn(BookmarksRouter.prototype, 'createRoute').mockImplementation();
    const bookmarksRouter = new BookmarksRouter(app);
    expect(initRoutesSpy).toHaveBeenCalled();
    expect(createRouteMock).toHaveBeenCalledWith(Verb.get, '/:id/version', { '^1.1.3': expect.any(Function) });
  });

  it('createBookmarks_v1: should call next with RequiredDataNotFoundException if bookmarks data missing from request', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    jest.spyOn(BookmarksRouter.prototype, 'getBookmarksData').mockReturnValue('');
    const router = new BookmarksRouter(null);
    const next = jest.fn();
    await router.createBookmarks_v1(null, null, next);
    expect(next).toHaveBeenCalledWith(expect.any(RequiredDataNotFoundException));
  });

  it('createBookmarks_v1: should call service createBookmarks_v1 function and return the result in the response as json', async () => {
    const bookmarksDataTest = 'bookmarksDataTest';
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const getBookmarksDataMock = jest
      .spyOn(BookmarksRouter.prototype, 'getBookmarksData')
      .mockReturnValue(bookmarksDataTest);
    const createBookmarksResult = 'test';
    const createBookmarksV1Mock = jest.fn().mockImplementation(() => {
      return Promise.resolve(createBookmarksResult);
    });
    const serviceTest = {
      createBookmarks_v1: createBookmarksV1Mock,
    };
    const router = new BookmarksRouter(null, serviceTest as any);
    const req: Partial<Request> = {};
    const jsonMock = jest.fn();
    const res: Partial<Response> = {
      json: jsonMock,
    };
    await router.createBookmarks_v1(req as Request, res as Response, null);
    expect(getBookmarksDataMock).toHaveBeenCalledWith(req);
    expect(createBookmarksV1Mock).toHaveBeenCalledWith(bookmarksDataTest, req);
    expect(jsonMock).toHaveBeenCalledWith(createBookmarksResult);
  });

  it('createBookmarks_v2: should call next with RequiredDataNotFoundException if version missing from post data', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const router = new BookmarksRouter(null);
    const req: Partial<Request> = {
      body: {
        version: '',
      },
    };
    const next = jest.fn();
    await router.createBookmarks_v2(req as Request, null, next);
    expect(next).toHaveBeenCalledWith(expect.any(RequiredDataNotFoundException));
  });

  it('createBookmarks_v2: should call service createBookmarks_v2 function and return the result in the response as json', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const createBookmarksResult = 'test';
    const createBookmarksV2Mock = jest.fn().mockImplementation(() => {
      return Promise.resolve(createBookmarksResult);
    });
    const serviceTest = {
      createBookmarks_v2: createBookmarksV2Mock,
    };
    const router = new BookmarksRouter(null, serviceTest as any);
    const versionTest = '1.0.0';
    const req: Partial<Request> = {
      body: {
        version: versionTest,
      },
    };
    const jsonMock = jest.fn();
    const res: Partial<Response> = {
      json: jsonMock,
    };
    await router.createBookmarks_v2(req as Request, res as Response, null);
    expect(createBookmarksV2Mock).toHaveBeenCalledWith(versionTest, req);
    expect(jsonMock).toHaveBeenCalledWith(createBookmarksResult);
  });

  it('getBookmarks: should call next with error if an error is encountered', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const errorTest = new Error();
    jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation((): any => {
      throw errorTest;
    });
    const router = new BookmarksRouter(null);
    const next = jest.fn();
    await router.getBookmarks(null, null, next);
    expect(next).toHaveBeenCalledWith(errorTest);
  });

  it('getBookmarks: should call service getBookmarks function and return the result in the response as json', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const getSyncIdResult = 'syncIdTest';
    const getSyncIdMock = jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation((): any => {
      return getSyncIdResult;
    });
    const getBookmarksResult = 'bookmarksTest';
    const getBookmarksMock = jest.fn().mockImplementation(() => {
      return Promise.resolve(getBookmarksResult);
    });
    const serviceTest = {
      getBookmarks: getBookmarksMock,
    };
    const router = new BookmarksRouter(null, serviceTest as any);
    const req: Partial<Request> = {};
    const jsonMock = jest.fn();
    const res: Partial<Response> = {
      json: jsonMock,
    };
    await router.getBookmarks(req as Request, res as Response, null);
    expect(getSyncIdMock).toHaveBeenCalledWith(req);
    expect(getBookmarksMock).toHaveBeenCalledWith(getSyncIdResult, req);
    expect(jsonMock).toHaveBeenCalledWith(getBookmarksResult);
  });

  it('getBookmarksData: should return bookmarks value from post body', async () => {
    const bookmarksDataTest = 'bookmarksDataTest';
    const req: Partial<Request> = {
      body: {
        bookmarks: bookmarksDataTest,
      },
    };
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const router = new BookmarksRouter(null);
    const result = router.getBookmarksData(req as Request);
    expect(result).toStrictEqual(bookmarksDataTest);
  });

  it('getBookmarksData: should return an empty string if bookmarks value missing from post body', async () => {
    const req: Partial<Request> = {
      body: {},
    };
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const router = new BookmarksRouter(null);
    const result = router.getBookmarksData(req as Request);
    expect(result).toStrictEqual('');
  });

  it('getLastUpdated: should call next with error if an error is encountered', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const errorTest = new Error();
    jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation((): any => {
      throw errorTest;
    });
    const router = new BookmarksRouter(null);
    const next = jest.fn();
    await router.getLastUpdated(null, null, next);
    expect(next).toHaveBeenCalledWith(errorTest);
  });

  it('getLastUpdated: should call service getLastUpdated function and return the result in the response as json', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const getSyncIdResult = 'syncIdTest';
    const getSyncIdMock = jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation((): any => {
      return getSyncIdResult;
    });
    const getLastUpdatedResult = 'getLastUpdatedResult';
    const getLastUpdatedMock = jest.fn().mockImplementation(() => {
      return Promise.resolve(getLastUpdatedResult);
    });
    const serviceTest = {
      getLastUpdated: getLastUpdatedMock,
    };
    const router = new BookmarksRouter(null, serviceTest as any);
    const req: Partial<Request> = {};
    const jsonMock = jest.fn();
    const res: Partial<Response> = {
      json: jsonMock,
    };
    await router.getLastUpdated(req as Request, res as Response, null);
    expect(getSyncIdMock).toHaveBeenCalledWith(req);
    expect(getLastUpdatedMock).toHaveBeenCalledWith(getSyncIdResult, req);
    expect(jsonMock).toHaveBeenCalledWith(getLastUpdatedResult);
  });

  it('getSyncId: should throw an error if invalid id provided in request params', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const req: Partial<Request> = {
      params: {},
    };
    const error = new InvalidSyncIdException();
    jest.spyOn(Uuid, 'convertUuidStringToBinary').mockImplementation((): any => {
      throw error;
    });
    const router = new BookmarksRouter(null);
    expect(() => {
      router.getSyncId(req as Request);
    }).toThrow(error);
  });

  it('getSyncId: should return id provided in request params', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const idTest = 'idTest';
    const req: Partial<Request> = {
      params: {
        id: idTest,
      },
    };
    const convertUuidStringToBinaryMock = jest.spyOn(Uuid, 'convertUuidStringToBinary').mockImplementation();
    const router = new BookmarksRouter(null);
    const result = router.getSyncId(req as Request);
    expect(convertUuidStringToBinaryMock).toHaveBeenCalledWith(idTest);
    expect(result).toStrictEqual(idTest);
  });

  it('getVersion: should call next with error if an error is encountered', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const errorTest = new Error();
    jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation((): any => {
      throw errorTest;
    });
    const router = new BookmarksRouter(null);
    const next = jest.fn();
    await router.getVersion(null, null, next);
    expect(next).toHaveBeenCalledWith(errorTest);
  });

  it('getVersion: should call service getVersion function and return the result in the response as json', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const getSyncIdResult = 'syncIdTest';
    const getSyncIdMock = jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation((): any => {
      return getSyncIdResult;
    });
    const getVersionResult = '1.0.0';
    const getVersionMock = jest.fn().mockImplementation(() => {
      return Promise.resolve(getVersionResult);
    });
    const serviceTest = {
      getVersion: getVersionMock,
    };
    const router = new BookmarksRouter(null, serviceTest as any);
    const req: Partial<Request> = {};
    const jsonMock = jest.fn();
    const res: Partial<Response> = {
      json: jsonMock,
    };
    await router.getVersion(req as Request, res as Response, null);
    expect(getSyncIdMock).toHaveBeenCalledWith(req);
    expect(getVersionMock).toHaveBeenCalledWith(getSyncIdResult, req);
    expect(jsonMock).toHaveBeenCalledWith(getVersionResult);
  });

  it('updateBookmarks_v1: should call next with RequiredDataNotFoundException if bookmarks data missing from request', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation();
    jest.spyOn(BookmarksRouter.prototype, 'getBookmarksData').mockReturnValue('');
    const router = new BookmarksRouter(null);
    const next = jest.fn();
    await router.updateBookmarks_v1(null, null, next);
    expect(next).toHaveBeenCalledWith(expect.any(RequiredDataNotFoundException));
  });

  it('updateBookmarks_v1: should call service updateBookmarks_v1 function and return the result in the response as json', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const getSyncIdResult = 'syncIdTest';
    const getSyncIdMock = jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation((): any => {
      return getSyncIdResult;
    });
    const bookmarksDataTest = 'bookmarksDataTest';
    const getBookmarksDataMock = jest
      .spyOn(BookmarksRouter.prototype, 'getBookmarksData')
      .mockReturnValue(bookmarksDataTest);
    const updateBookmarksResult = 'test';
    const updateBookmarksV1Mock = jest.fn().mockImplementation(() => {
      return Promise.resolve(updateBookmarksResult);
    });
    const serviceTest = {
      updateBookmarks_v1: updateBookmarksV1Mock,
    };
    const router = new BookmarksRouter(null, serviceTest as any);
    const req: Partial<Request> = {};
    const jsonMock = jest.fn();
    const res: Partial<Response> = {
      json: jsonMock,
    };
    await router.updateBookmarks_v1(req as Request, res as Response, null);
    expect(getSyncIdMock).toHaveBeenCalledWith(req);
    expect(getBookmarksDataMock).toHaveBeenCalledWith(req);
    expect(updateBookmarksV1Mock).toHaveBeenCalledWith(getSyncIdResult, bookmarksDataTest, req);
    expect(jsonMock).toHaveBeenCalledWith(updateBookmarksResult);
  });

  it('updateBookmarks_v2: should call next with RequiredDataNotFoundException if bookmarks data missing from request', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation();
    jest.spyOn(BookmarksRouter.prototype, 'getBookmarksData').mockReturnValue('');
    const router = new BookmarksRouter(null);
    const next = jest.fn();
    await router.updateBookmarks_v2(null, null, next);
    expect(next).toHaveBeenCalledWith(expect.any(RequiredDataNotFoundException));
  });

  it('updateBookmarks_v2: should call service updateBookmarks_v1 function and return the result in the response as json', async () => {
    jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const getSyncIdResult = 'syncIdTest';
    const getSyncIdMock = jest.spyOn(BookmarksRouter.prototype, 'getSyncId').mockImplementation((): any => {
      return getSyncIdResult;
    });
    const bookmarksDataTest = 'bookmarksDataTest';
    const getBookmarksDataMock = jest
      .spyOn(BookmarksRouter.prototype, 'getBookmarksData')
      .mockReturnValue(bookmarksDataTest);
    const updateBookmarksResult = 'test';
    const updateBookmarksV2Mock = jest.fn().mockImplementation(() => {
      return Promise.resolve(updateBookmarksResult);
    });
    const serviceTest = {
      updateBookmarks_v2: updateBookmarksV2Mock,
    };
    const router = new BookmarksRouter(null, serviceTest as any);
    const lastUpdatedTest = 'lastUpdatedTest';
    const versionTest = 'versionTest';
    const req: Partial<Request> = {
      body: {
        lastUpdated: lastUpdatedTest,
        version: versionTest,
      },
    };
    const jsonMock = jest.fn();
    const res: Partial<Response> = {
      json: jsonMock,
    };
    await router.updateBookmarks_v2(req as Request, res as Response, null);
    expect(getSyncIdMock).toHaveBeenCalledWith(req);
    expect(getBookmarksDataMock).toHaveBeenCalledWith(req);
    expect(updateBookmarksV2Mock).toHaveBeenCalledWith(
      getSyncIdResult,
      bookmarksDataTest,
      lastUpdatedTest,
      versionTest,
      req
    );
    expect(jsonMock).toHaveBeenCalledWith(updateBookmarksResult);
  });
});
