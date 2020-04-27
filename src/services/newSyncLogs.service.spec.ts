import 'jest';
import { Request } from 'express';
import * as Config from '../../src/config';
import NewSyncLogsModel from '../models/newSyncLogs.model';
import NewSyncLogsService from './newSyncLogs.service';
import { LogLevel } from '../server';
import { UnspecifiedException } from '../exception';

describe('NewSyncLogsService', () => {
  const testClientIPAddress = '123.456.789.0';
  let newSyncLogsService: NewSyncLogsService;
  let testConfig: Config.IConfigSettings;

  beforeEach(() => {
    testConfig = Config.get(true);
    const log = () => null;
    newSyncLogsService = new NewSyncLogsService(null, log);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createLog: should create a new sync log using the request IP address', async () => {
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };
    const saveMock = jest.spyOn(NewSyncLogsModel.prototype, 'save').mockResolvedValue(null);
    const savedTestLog = await newSyncLogsService.createLog(req as Request);
    expect(saveMock).toHaveBeenCalled();
    expect(savedTestLog.ipAddress).toStrictEqual(testClientIPAddress);
  });

  it('createLog: should log error if encoutered when saving', async () => {
    const errorTest = new Error();
    jest.spyOn(NewSyncLogsModel.prototype, 'save').mockImplementation(() => {
      throw errorTest;
    });
    jest.spyOn(newSyncLogsService, 'getClientIpAddress').mockReturnValue('test');
    const logMock = jest.spyOn(newSyncLogsService, 'log').mockImplementation();
    const req: Partial<Request> = {};
    await expect(newSyncLogsService.createLog(req as Request))
      .rejects
      .toThrow(errorTest);
    expect(logMock).toHaveBeenCalledWith(LogLevel.Error, expect.any(String), req, errorTest);
  });

  it('createLog: should return null if the request IP address could not be ascertained', async () => {
    const req: Partial<Request> = {};
    const response = await newSyncLogsService.createLog(req as Request);
    expect(response).toBeNull();
  });

  it('newSyncsLimitHit: should return true if the request IP address has hit the limit for daily new syncs created', async () => {
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };
    const dailyNewSyncsLimitTestVal = 1;
    testConfig.dailyNewSyncsLimit = dailyNewSyncsLimitTestVal;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const countDocumentsSpy = jest.spyOn(NewSyncLogsModel, 'countDocuments').mockReturnValue({
      exec: () => Promise.resolve(dailyNewSyncsLimitTestVal)
    } as any);
    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(countDocumentsSpy).toHaveBeenCalled();
    expect(limitHit).toBe(true);
  });

  it('newSyncsLimitHit: should log error if encoutered when calling countDocuments on the model', async () => {
    jest.spyOn(newSyncLogsService, 'getClientIpAddress').mockReturnValue('test');
    const errorTest = new Error();
    jest.spyOn(NewSyncLogsModel, 'countDocuments').mockImplementation(() => {
      throw errorTest;
    });
    const logMock = jest.spyOn(newSyncLogsService, 'log').mockImplementation();
    const req: Partial<Request> = {};
    await expect(newSyncLogsService.newSyncsLimitHit(req as Request))
      .rejects
      .toThrow(errorTest);
    expect(logMock).toHaveBeenCalledWith(LogLevel.Error, expect.any(String), req, errorTest);
  });

  it('newSyncsLimitHit: should log error if countDocuments returns a value less than zero', async () => {
    jest.spyOn(newSyncLogsService, 'getClientIpAddress').mockReturnValue('test');
    jest.spyOn(NewSyncLogsModel, 'countDocuments').mockReturnValue({
      exec: () => Promise.resolve(-1)
    } as any);
    const logMock = jest.spyOn(newSyncLogsService, 'log').mockImplementation();
    const req: Partial<Request> = {};
    await expect(newSyncLogsService.newSyncsLimitHit(req as Request))
      .rejects
      .toThrow(UnspecifiedException);
    expect(logMock).toHaveBeenCalledWith(LogLevel.Error, expect.any(String), req, expect.any(UnspecifiedException));
  });

  it('newSyncsLimitHit: should return false if the request IP address has not hit the limit for daily new syncs created', async () => {
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };
    testConfig.dailyNewSyncsLimit = 3;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const countDocumentsMock = jest.spyOn(NewSyncLogsModel, 'countDocuments').mockReturnValue({
      exec: () => Promise.resolve(1)
    } as any);
    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(countDocumentsMock).toHaveBeenCalled();
    expect(limitHit).toBe(false);
  });

  it('newSyncsLimitHit: should return null if the request IP address could not be ascertained', async () => {
    const req: Partial<Request> = {};
    const response = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(response).toBeNull();
  });
});