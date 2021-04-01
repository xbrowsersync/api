import 'jest';
import { Request } from 'express';
import { LogLevel } from '../common/enums';
import * as Config from '../config';
import { UnspecifiedException } from '../exception';
import { NewSyncLogsModel } from '../models/newSyncLogs.model';
import { NewSyncLogsService } from './newSyncLogs.service';

jest.mock('../models/newSyncLogs.model');

describe('NewSyncLogsService', () => {
  const ipAddressTest = '123.456.789.0';
  let logMock: jest.Mock<any, any>;

  beforeEach(() => {
    logMock = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createLog: should create a new sync log using the request IP address', async () => {
    const getClientIpAddressMock = jest
      .spyOn(NewSyncLogsService.prototype, 'getClientIpAddress')
      .mockReturnValue(ipAddressTest);
    jest.spyOn(NewSyncLogsModel.prototype, 'save').mockResolvedValue(null);
    const newSyncLogsService = new NewSyncLogsService(null, jest.fn());
    const req: Partial<Request> = {};
    const savedTestLog = await newSyncLogsService.createLog(req as Request);
    expect(getClientIpAddressMock).toHaveBeenCalledWith(req);
    expect(savedTestLog.ipAddress).toStrictEqual(ipAddressTest);
  });

  it('createLog: should log error if encoutered when saving document to db', async () => {
    jest.spyOn(NewSyncLogsService.prototype, 'getClientIpAddress').mockReturnValue(ipAddressTest);
    const errorTest = new Error();
    jest.spyOn(NewSyncLogsModel.prototype, 'save').mockImplementation(() => {
      throw errorTest;
    });
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {};
    await expect(newSyncLogsService.createLog(req as Request)).rejects.toThrow(errorTest);
    expect(logMock).toHaveBeenCalledWith(LogLevel.Error, expect.any(String), req, errorTest);
  });

  it('createLog: should return null if the request IP address could not be ascertained', async () => {
    jest.spyOn(NewSyncLogsService.prototype, 'getClientIpAddress').mockReturnValue(null);
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {};
    const response = await newSyncLogsService.createLog(req as Request);
    expect(response).toBeNull();
    expect(logMock).toHaveBeenCalledWith(LogLevel.Info, expect.any(String));
  });

  it('newSyncsLimitHit: should return true if the request IP address has hit the limit for daily new syncs created', async () => {
    jest.spyOn(NewSyncLogsService.prototype, 'getClientIpAddress').mockReturnValue(ipAddressTest);
    const configSettingsTest: Config.IConfigSettings = {
      dailyNewSyncsLimit: 1,
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const countDocumentsMock = jest.spyOn(NewSyncLogsModel, 'countDocuments').mockReturnValue({
      exec: () => Promise.resolve(1),
    } as any);
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {};
    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(countDocumentsMock).toHaveBeenCalledWith({ ipAddress: ipAddressTest });
    expect(limitHit).toBe(true);
  });

  it('newSyncsLimitHit: should return false if the request IP address has not hit the limit for daily new syncs created', async () => {
    jest.spyOn(NewSyncLogsService.prototype, 'getClientIpAddress').mockReturnValue(ipAddressTest);
    const dailyNewSyncsLimitTest = 1;
    const configSettingsTest: Config.IConfigSettings = {
      dailyNewSyncsLimit: dailyNewSyncsLimitTest,
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const countDocumentsMock = jest.spyOn(NewSyncLogsModel, 'countDocuments').mockReturnValue({
      exec: () => Promise.resolve(0),
    } as any);
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {};
    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(countDocumentsMock).toHaveBeenCalledWith({ ipAddress: ipAddressTest });
    expect(limitHit).toBe(false);
  });

  it('newSyncsLimitHit: should return null if the request IP address could not be ascertained', async () => {
    jest.spyOn(NewSyncLogsService.prototype, 'getClientIpAddress').mockReturnValue(null);
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {};
    const response = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(response).toBeNull();
    expect(logMock).toHaveBeenCalledWith(LogLevel.Info, expect.any(String));
  });

  it('newSyncsLimitHit: should log error if encoutered when retrieving documents count from db', async () => {
    jest.spyOn(NewSyncLogsService.prototype, 'getClientIpAddress').mockReturnValue(ipAddressTest);
    const errorTest = new Error();
    jest.spyOn(NewSyncLogsModel, 'countDocuments').mockImplementation(() => {
      throw errorTest;
    });
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {};
    await expect(newSyncLogsService.newSyncsLimitHit(req as Request)).rejects.toThrow(errorTest);
    expect(logMock).toHaveBeenCalledWith(LogLevel.Error, expect.any(String), req, errorTest);
  });

  it('newSyncsLimitHit: should log error if countDocuments returns a value less than zero', async () => {
    jest.spyOn(NewSyncLogsService.prototype, 'getClientIpAddress').mockReturnValue(ipAddressTest);
    jest.spyOn(NewSyncLogsModel, 'countDocuments').mockReturnValue({
      exec: () => Promise.resolve(-1),
    } as any);
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {};
    await expect(newSyncLogsService.newSyncsLimitHit(req as Request)).rejects.toThrow(UnspecifiedException);
    expect(logMock).toHaveBeenCalledWith(LogLevel.Error, expect.any(String), req, expect.any(UnspecifiedException));
  });

  it('getClientIpAddress: should return the ip address associated with the request', () => {
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {
      ip: ipAddressTest,
    };
    const ipAddress = newSyncLogsService.getClientIpAddress(req as Request);
    expect(ipAddress).toStrictEqual(ipAddressTest);
  });

  it('getClientIpAddress: should return null if no request object provided', () => {
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const ipAddress = newSyncLogsService.getClientIpAddress(null);
    expect(ipAddress).toBeNull();
  });

  it('getClientIpAddress: should return null if no ip address associated with the request object provided', () => {
    const newSyncLogsService = new NewSyncLogsService(null, logMock);
    const req: Partial<Request> = {};
    const ipAddress = newSyncLogsService.getClientIpAddress(req as Request);
    expect(ipAddress).toBeNull();
  });
});
