// tslint:disable:no-unused-expression

import 'jest';
import { Request } from 'express';
import Config from '../config';
import { ApiStatus } from '../server';
import BookmarksService from './bookmarks.service';
import InfoService from './info.service';

describe('InfoService', () => {
  let bookmarksService: BookmarksService;
  let infoService: InfoService;
  let testConfig: any;
  let isAcceptingNewSyncsSpy: any;

  beforeEach(() => {
    testConfig = Config.get(true);
    const log = () => null;
    bookmarksService = new BookmarksService(null, log);
    infoService = new InfoService(bookmarksService as BookmarksService, log);
    isAcceptingNewSyncsSpy = jest.spyOn(bookmarksService, 'isAcceptingNewSyncs').mockResolvedValue(true);
  });

  afterEach(() => {
    isAcceptingNewSyncsSpy.mockRestore();
  });

  it('getInfo: should return location config value', async () => {
    const req: Partial<Request> = {};
    const location = 'gb';
    testConfig.location = location;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await infoService.getInfo(req as Request);
    expect(response.location).toEqual(location.toUpperCase());
    spy.mockRestore();
  });

  it('getInfo: should return max sync size config value', async () => {
    const req: Partial<Request> = {};
    const maxSyncSizeTestVal = 1;
    testConfig.maxSyncSize = maxSyncSizeTestVal;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await infoService.getInfo(req as Request);
    expect(response.maxSyncSize).toEqual(maxSyncSizeTestVal);
    spy.mockRestore();
  });

  it('getInfo: should return message config value', async () => {
    const req: Partial<Request> = {};
    const messageTestVal = 'Test API message';
    testConfig.status.message = messageTestVal;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await infoService.getInfo(req as Request);
    expect(response.message).toEqual(messageTestVal);
    spy.mockRestore();
  });

  it('getInfo: should strip script tags from message config value', async () => {
    const req: Partial<Request> = {};
    const messageTestVal = `<script>alert('test');</script>`;
    testConfig.status.message = messageTestVal;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await infoService.getInfo(req as Request);
    expect(response.message).toEqual('');
    spy.mockRestore();
  });

  it('getInfo: should return correct API status when online', async () => {
    const req: Partial<Request> = {};
    testConfig.status.online = true;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await infoService.getInfo(req as Request);
    expect(response.status).toEqual(ApiStatus.online);
    spy.mockRestore();
  });

  it('getInfo: should return correct API status when offline', async () => {
    const req: Partial<Request> = {};
    testConfig.status.online = false;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await infoService.getInfo(req as Request);
    expect(response.status).toEqual(ApiStatus.offline);
    spy.mockRestore();
  });

  it('getInfo: should return version config value', async () => {
    const req: Partial<Request> = {};
    const versionTestVal = '0.0.0';
    testConfig.version = versionTestVal;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await infoService.getInfo(req as Request);
    expect(response.version).toEqual(versionTestVal);
    spy.mockRestore();
  });
});