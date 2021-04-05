import 'jest';
import bunyan from 'bunyan';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import mkdirp from 'mkdirp';
import { LogLevel } from './common/enums';
import * as Config from './config';
import * as DB from './db';
import {
  ApiException,
  OriginNotPermittedException,
  SyncDataLimitExceededException,
  UnspecifiedException,
} from './exception';
import * as Location from './location';
import { BookmarksRouter } from './routers/bookmarks.router';
import { DocsRouter } from './routers/docs.router';
import { InfoRouter } from './routers/info.router';
import * as Server from './server';

let corsConfig: cors.CorsOptions;
jest.mock('cors', () => {
  return jest.fn().mockImplementation((config: cors.CorsOptions) => {
    corsConfig = config;
  });
});

describe('Server', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('cleanupServer: should close db connection', async () => {
    const disconnectSpy = jest.spyOn(DB, 'disconnect');
    await Server.cleanupServer({
      removeAllListeners: () => {},
    } as any);
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('createApplication: should create, configure and return a new express app', async () => {
    const initApplicationMock = jest.spyOn(Server, 'initApplication').mockImplementation();
    const initRoutesMock = jest.spyOn(Server, 'initRoutes').mockImplementation();
    const connectMock = jest.spyOn(DB, 'connect').mockImplementation();
    const app = await Server.createApplication();
    expect(app).not.toBeNull();
    expect(initApplicationMock).toHaveBeenCalledWith(app);
    expect(initRoutesMock).toHaveBeenCalledWith(app);
    expect(connectMock).toHaveBeenCalled();
  });

  it('createApplication: should exit process if an error is encountered', async () => {
    jest.spyOn(Server, 'initApplication').mockImplementation(() => {
      throw new Error();
    });
    const exitMock = jest.spyOn(process, 'exit').mockImplementation();
    await Server.createApplication();
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it('createLogger: should create a bunyan logger with the provided streams', async () => {
    const createLoggerSpy = jest.spyOn(bunyan, 'createLogger').mockImplementation();
    const streamsTest = [];
    Server.createLogger(streamsTest);
    expect(createLoggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        streams: streamsTest,
      })
    );
  });

  it('createLogger: should output error message to console if bunyan.createLogger throws an error', async () => {
    jest.spyOn(bunyan, 'createLogger').mockImplementation(() => {
      throw new Error();
    });
    const errorMock = jest.spyOn(console, 'error').mockImplementation();
    expect(() => {
      Server.createLogger([]);
    }).toThrowError();
    expect(errorMock).toHaveBeenCalled();
  });

  it('initApplication: should enable logging to stdout if specified in config settings', () => {
    const logLevelTest = 'debug';
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: true,
          level: logLevelTest,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const createLoggerMock = jest.spyOn(Server, 'createLogger');
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: jest.fn(),
    };
    Server.initApplication(app);
    expect(createLoggerMock).toBeCalledWith([
      {
        level: logLevelTest,
        stream: process.stdout,
      },
    ]);
  });

  it('initApplication: should enable logging to file if specified in config settings', () => {
    const logLevelTest = 'debug';
    const logPathTest = '/var/log/xbs/api.log';
    const logRotatedFilesToKeepTest = 1;
    const logRotationPeriodTest = '1w';
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: true,
          level: logLevelTest,
          path: logPathTest,
          rotatedFilesToKeep: logRotatedFilesToKeepTest,
          rotationPeriod: logRotationPeriodTest,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const createLoggerMock = jest.spyOn(Server, 'createLogger').mockImplementation();
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: jest.fn(),
    };
    Server.initApplication(app);
    expect(createLoggerMock).toBeCalledWith([
      {
        count: logRotatedFilesToKeepTest,
        level: logLevelTest,
        path: logPathTest,
        period: logRotationPeriodTest,
        type: 'rotating-file',
      },
    ]);
  });

  it('initApplication: should create a directory for the log file if not exists and file log enabled in config settings', () => {
    const logLevelTest = 'debug';
    const logPathDirTest = '/var/log/xbs';
    const logPathTest = '/var/log/xbs/api.log';
    const logRotatedFilesToKeepTest = 1;
    const logRotationPeriodTest = '1w';
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: true,
          level: logLevelTest,
          path: logPathTest,
          rotatedFilesToKeep: logRotatedFilesToKeepTest,
          rotationPeriod: logRotationPeriodTest,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    const syncMock = jest.spyOn(mkdirp, 'sync').mockImplementation();
    jest.spyOn(Server, 'createLogger').mockImplementation();
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: jest.fn(),
    };
    Server.initApplication(app);
    expect(syncMock).toBeCalledWith(logPathDirTest);
  });

  it('initApplication: should throw an error if file path not specified and file log enabled in config settings', () => {
    const logLevelTest = 'debug';
    const logRotatedFilesToKeepTest = 1;
    const logRotationPeriodTest = '1w';
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: true,
          level: logLevelTest,
          rotatedFilesToKeep: logRotatedFilesToKeepTest,
          rotationPeriod: logRotationPeriodTest,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(console, 'error').mockImplementation();
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: jest.fn(),
    };
    expect(() => {
      Server.initApplication(app);
    }).toThrowError();
  });

  it('initApplication: should limit size of json encoded request bodies by default to 512000', () => {
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const jsonMock = jest.spyOn(express, 'json').mockImplementation();
    const useMock = jest.fn().mockImplementation((callback) => {
      try {
        callback();
      } catch {}
    });
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: useMock,
    };
    Server.initApplication(app);
    expect(jsonMock).toHaveBeenCalledWith({
      limit: 512000,
    });
  });

  it('initApplication: should limit size of json encoded request bodies to maxSyncSize defined in config settings', () => {
    const maxSyncSizeTest = 999999;
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      maxSyncSize: maxSyncSizeTest,
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const jsonMock = jest.spyOn(express, 'json').mockImplementation();
    const useMock = jest.fn().mockImplementation((callback) => {
      try {
        callback();
      } catch {}
    });
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: useMock,
    };
    Server.initApplication(app);
    expect(jsonMock).toHaveBeenCalledWith({
      limit: maxSyncSizeTest,
    });
  });

  it('initApplication: should configure cors with undefined if no origins set in config settings', () => {
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const useMock = jest.fn().mockImplementation((callback) => {
      try {
        callback();
      } catch {}
    });
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: useMock,
    };
    Server.initApplication(app);
    expect(corsConfig).toBeUndefined();
  });

  it('initApplication: should throw OriginNotPermittedException exception if origin not present in allowedOrigins defined in config settings', () => {
    const originTest = 'http://www.allowed-origin.com';
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [originTest],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const useMock = jest.fn().mockImplementation((callback) => {
      try {
        callback();
      } catch {}
    });
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: useMock,
    };
    Server.initApplication(app);
    let originErr: Error;
    try {
      (corsConfig.origin as any)('http://www.forbidden-origin.com', (err: Error) => {
        originErr = err;
      });
    } catch {}
    expect(corsConfig).toStrictEqual({
      origin: expect.any(Function),
    });
    expect(() => {
      throw originErr;
    }).toThrow(OriginNotPermittedException);
  });

  it('initApplication: should allow origin if present in allowedOrigins defined in config settings', () => {
    const originTest = 'http://www.allowed-origin.com';
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [originTest],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const useMock = jest.fn().mockImplementation((callback) => {
      try {
        callback();
      } catch {}
    });
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: useMock,
    };
    Server.initApplication(app);
    const originCallbackMock = jest.fn();
    try {
      (corsConfig.origin as any)(originTest, originCallbackMock);
    } catch {}
    expect(corsConfig).toStrictEqual({
      origin: expect.any(Function),
    });
    expect(originCallbackMock).toBeCalledWith(null, true);
  });

  it('initApplication: should add noCache to application', () => {
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const useMock = jest.fn().mockImplementation((callback) => {
      try {
        expect(callback.name).toBe('noCache');
      } catch {}
    });
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: useMock,
    };
    Server.initApplication(app);
  });

  it('initApplication: should add existing version specified in request headers to request headers', () => {
    const versionTest = '9.9.9';
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
      version: '1.0.0',
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const req: any = {
      headers: {
        'accept-version': versionTest,
      },
    };
    const nextMock = jest.fn();
    const useMock = jest.fn().mockImplementation((callback) => {
      try {
        callback(req, null, nextMock);
        expect(req.version).toStrictEqual(versionTest);
      } catch {}
    });
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: useMock,
    };
    Server.initApplication(app);
  });

  it('initApplication: should add api version specified in config settings to request headers', () => {
    const versionTest = '9.9.9';
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: false,
      },
      throttle: {
        maxRequests: 0,
      },
      version: versionTest,
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const req: any = {
      headers: [],
    };
    const nextMock = jest.fn();
    const useMock = jest.fn().mockImplementation((callback) => {
      try {
        callback(req, null, nextMock);
        expect(req.version).toStrictEqual(versionTest);
      } catch {}
    });
    const app: any = {
      enable: jest.fn(),
      options: jest.fn(),
      use: useMock,
    };
    Server.initApplication(app);
  });

  it('initApplication: should enable trust proxy if behindProxy enabled in config settings', () => {
    const configSettingsTest: Config.IConfigSettings = {
      allowedOrigins: [],
      log: {
        file: {
          enabled: false,
        },
        stdout: {
          enabled: false,
        },
      },
      server: {
        behindProxy: true,
      },
      throttle: {
        maxRequests: 0,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const enableMock = jest.fn();
    const app: any = {
      enable: enableMock,
      options: jest.fn(),
      use: jest.fn(),
    };
    Server.initApplication(app);
    expect(enableMock).toHaveBeenCalledWith('trust proxy');
  });

  it('handleError: should set response status code to 500 if no status code provided', async () => {
    const statusMock = jest.fn();
    const req: any = {
      accepts: jest.fn,
    };
    const res: any = {
      json: () => {},
      status: statusMock,
    };
    Server.handleError(new Error(), req, res, jest.fn);
    expect(statusMock).toHaveBeenCalledWith(500);
  });

  it('handleError: should set response status code to status code provided', async () => {
    const statusTest = 999;
    const exception = new ApiException('');
    exception.status = statusTest;
    const statusMock = jest.fn();
    const req: any = {
      accepts: jest.fn,
    };
    const res: any = {
      json: () => {},
      status: statusMock,
    };
    Server.handleError(exception, req, res, jest.fn);
    expect(statusMock).toHaveBeenCalledWith(statusTest);
  });

  it('handleError: should set response json to with provided error response object', async () => {
    const message = 'test';
    const exception = new ApiException(message);
    const jsonMock = jest.fn();
    const req: any = {
      accepts: jest.fn,
    };
    const res: any = {
      json: jsonMock,
      status: () => {},
    };
    Server.handleError(exception, req, res, jest.fn);
    expect(jsonMock).toHaveBeenCalledWith(exception.getResponseObject());
  });

  it('handleError: should set response json to SyncDataLimitExceededException response object if provided error status code is 413', async () => {
    const exception = new Error();
    (exception as any).status = 413;
    const jsonMock = jest.fn();
    const req: any = {
      accepts: jest.fn,
    };
    const res: any = {
      json: jsonMock,
      status: () => {},
    };
    Server.handleError(exception, req, res, jest.fn);
    expect(jsonMock).toHaveBeenCalledWith(new SyncDataLimitExceededException().getResponseObject());
  });

  it('handleError: should set response json to UnspecifiedException response object if provided error is not an instance of ExceptionBase', async () => {
    const jsonMock = jest.fn();
    const req: any = {
      accepts: jest.fn,
    };
    const res: any = {
      json: jsonMock,
      status: jest.fn,
    };
    Server.handleError(new Error(), req, res, jest.fn);
    expect(jsonMock).toHaveBeenCalledWith(new UnspecifiedException().getResponseObject());
  });

  it('initRoutes: should initialise docs routes', async () => {
    const initDocsRouterRoutesMock = jest.spyOn(DocsRouter.prototype, 'initRoutes').mockImplementation();
    const app: any = {
      get: jest.fn(),
      use: jest.fn(),
    };
    Server.initRoutes(app);
    expect(initDocsRouterRoutesMock).toHaveBeenCalled();
  });

  it('initRoutes: should initialise bookmarks routes', async () => {
    const initBookmarksRouterRoutesMock = jest.spyOn(BookmarksRouter.prototype, 'initRoutes').mockImplementation();
    const app: any = {
      get: jest.fn(),
      use: jest.fn(),
    };
    Server.initRoutes(app);
    expect(initBookmarksRouterRoutesMock).toHaveBeenCalled();
  });

  it('initRoutes: should initialise info routes', async () => {
    const initInfoRouterRoutesMock = jest.spyOn(InfoRouter.prototype, 'initRoutes').mockImplementation();
    const app: any = {
      get: jest.fn(),
      use: jest.fn(),
    };
    Server.initRoutes(app);
    expect(initInfoRouterRoutesMock).toHaveBeenCalled();
  });

  it('logMessage: should call logger.error when log level is error', async () => {
    const errorTest = new Error();
    const reqTest = {};
    const formatTest = {
      err: errorTest,
      req: reqTest,
    };
    const messageTest = 'test message';
    const errorMock = jest.fn();
    jest.spyOn(bunyan, 'createLogger').mockImplementation(() => {
      return {
        error: errorMock,
      } as any;
    });
    Server.createLogger([]);
    Server.logMessage(LogLevel.Error, messageTest, reqTest as any, errorTest);
    expect(errorMock).toHaveBeenCalledWith(expect.objectContaining(formatTest), messageTest);
  });

  it('logMessage: should call logger.info when log level is info', async () => {
    const reqTest = {};
    const formatTest = {
      req: reqTest,
    };
    const messageTest = 'test message';
    const infoMock = jest.fn();
    jest.spyOn(bunyan, 'createLogger').mockImplementation(() => {
      return {
        info: infoMock,
      } as any;
    });
    Server.createLogger([]);
    Server.logMessage(LogLevel.Info, messageTest, reqTest as any);
    expect(infoMock).toHaveBeenCalledWith(expect.objectContaining(formatTest), messageTest);
  });

  it('startService: should exit if an invalid location code is used in config settings', async () => {
    const locationTest = 'locationTest';
    const configSettingsTest: Config.IConfigSettings = {
      location: locationTest,
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const validateLocationCodeMock = jest.spyOn(Location, 'validateLocationCode').mockReturnValue(false);
    jest.spyOn(Server, 'logMessage').mockImplementation();
    const exitMock = jest.spyOn(process, 'exit').mockImplementation();
    await Server.startService({} as any);
    expect(validateLocationCodeMock).toHaveBeenCalledWith(locationTest);
    expect(exitMock).toHaveBeenCalled();
  });

  it('startService: should create an http server by default', async () => {
    const portTest = 12345;
    const configSettingsTest: Config.IConfigSettings = {
      server: {
        https: {
          enabled: false,
        },
        port: portTest,
      },
    };
    jest.spyOn(Location, 'validateLocationCode').mockReturnValue(true);
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(fs, 'readFileSync').mockImplementation((x) => x as any);
    jest.spyOn(process, 'on').mockImplementation();
    const listenMockReturnValue = {
      on: jest.fn(),
    };
    const listenMock = jest.fn().mockReturnValue(listenMockReturnValue);
    const createServerMock = jest.spyOn(http, 'createServer').mockReturnValue({
      listen: listenMock,
    } as any);
    const app = {} as any;
    const server = await Server.startService(app);
    expect(createServerMock).toHaveBeenCalledWith(app);
    expect(listenMock).toHaveBeenCalledWith(portTest, null, expect.anything());
    expect(server).toBe(listenMockReturnValue);
  });

  it('startService: should create an https server if specified in config settings', async () => {
    const certPathTest = 'certPathTest';
    const keyPathTest = 'keyPathTest';
    const portTest = 12345;
    const configSettingsTest: Config.IConfigSettings = {
      server: {
        https: {
          certPath: certPathTest,
          enabled: true,
          keyPath: keyPathTest,
        },
        port: portTest,
      },
    };
    jest.spyOn(Location, 'validateLocationCode').mockReturnValue(true);
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(fs, 'readFileSync').mockImplementation((x) => x as any);
    jest.spyOn(process, 'on').mockImplementation();
    const listenMockReturnValue = {
      on: jest.fn(),
    };
    const listenMock = jest.fn().mockReturnValue(listenMockReturnValue);
    const createServerMock = jest.spyOn(https, 'createServer').mockReturnValue({
      listen: listenMock,
    } as any);
    const optionsTest: https.ServerOptions = {
      cert: certPathTest,
      key: keyPathTest,
    };
    const app = {} as any;
    const server = await Server.startService(app);
    expect(createServerMock).toHaveBeenCalledWith(optionsTest, app);
    expect(listenMock).toHaveBeenCalledWith(portTest, null, expect.anything());
    expect(server).toBe(listenMockReturnValue);
  });

  it('startService: should stop server on SIGINT event', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      server: {
        https: {
          enabled: false,
        },
      },
    };
    jest.spyOn(Location, 'validateLocationCode').mockReturnValue(true);
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const serverTest: any = {
      close: async (callback): Promise<any> => {
        await callback();
      },
    };
    jest.spyOn(http, 'createServer').mockReturnValue({
      listen: jest.fn().mockReturnValue(serverTest),
    } as any);
    jest.spyOn(process, 'on').mockImplementation((event: string | symbol, callback): any => {
      if (event === 'SIGINT') {
        callback(null, null, null);
      }
    });
    const cleanupServerMock = jest.spyOn(Server, 'cleanupServer').mockImplementation(() => {
      return Promise.resolve();
    });
    const exitMock = jest.spyOn(process, 'exit').mockImplementation();
    await Server.startService({} as any);
    expect(cleanupServerMock).toHaveBeenCalledWith(serverTest);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it('startService: should stop server on SIGUSR1 event', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      server: {
        https: {
          enabled: false,
        },
      },
    };
    jest.spyOn(Location, 'validateLocationCode').mockReturnValue(true);
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const serverTest: any = {
      close: async (callback): Promise<any> => {
        await callback();
      },
    };
    jest.spyOn(http, 'createServer').mockReturnValue({
      listen: jest.fn().mockReturnValue(serverTest),
    } as any);
    jest.spyOn(process, 'on').mockImplementation((event: string | symbol, callback): any => {
      if (event === 'SIGUSR1') {
        callback(null, null, null);
      }
    });
    const cleanupServerMock = jest.spyOn(Server, 'cleanupServer').mockImplementation(() => {
      return Promise.resolve();
    });
    const exitMock = jest.spyOn(process, 'exit').mockImplementation();
    await Server.startService({} as any);
    expect(cleanupServerMock).toHaveBeenCalledWith(serverTest);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it('startService: should stop server on SIGUSR2 event', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      server: {
        https: {
          enabled: false,
        },
      },
    };
    jest.spyOn(Location, 'validateLocationCode').mockReturnValue(true);
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const serverTest: any = {
      close: async (callback): Promise<any> => {
        await callback();
      },
    };
    jest.spyOn(http, 'createServer').mockReturnValue({
      listen: jest.fn().mockReturnValue(serverTest),
    } as any);
    jest.spyOn(process, 'on').mockImplementation((event: string | symbol, callback): any => {
      if (event === 'SIGUSR2') {
        callback(null, null, null);
      }
    });
    const cleanupServerMock = jest.spyOn(Server, 'cleanupServer').mockImplementation(() => {
      return Promise.resolve();
    });
    const exitMock = jest.spyOn(process, 'exit').mockImplementation();
    await Server.startService({} as any);
    expect(cleanupServerMock).toHaveBeenCalledWith(serverTest);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it('stopService: should close the provided server', async () => {
    const closeMock = jest.fn(async (callback: () => Promise<void>) => {
      await callback();
    });
    const serverTest: any = {
      close: closeMock,
    };
    const cleanupServerMock = jest.spyOn(Server, 'cleanupServer').mockResolvedValue();
    await Server.stopService(serverTest);
    expect(closeMock).toHaveBeenCalled();
    expect(cleanupServerMock).toHaveBeenCalledWith(serverTest);
  });
});
