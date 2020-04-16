import 'jest';
import { Request } from 'express';
import * as Config from '../../src/config';
import NewSyncLogsModel from '../models/newSyncLogs.model';
import NewSyncLogsService from './newSyncLogs.service';

describe('NewSyncLogsService', () => {
  const testClientIPAddress = '123.456.789.0';
  let newSyncLogsService: NewSyncLogsService;
  let testConfig: any;

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
    expect(saveMock).toBeCalled();
    expect(savedTestLog.ipAddress).toEqual(testClientIPAddress);
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
    expect(countDocumentsSpy).toBeCalled();
    expect(limitHit).toBe(true);
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
    expect(countDocumentsMock).toBeCalled();
    expect(limitHit).toBe(false);
  });

  it('newSyncsLimitHit: should return null if the request IP address could not be ascertained', async () => {
    const req: Partial<Request> = {};
    const response = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(response).toBeNull();
  });
});