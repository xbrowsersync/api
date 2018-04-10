import { expect } from 'chai';
import { Express, Response, Request } from 'express';
import 'mocha';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
import BookmarksService from '../src/bookmarksService';
import InfoService from '../src/infoService';
import { ApiStatus } from '../src/server';
const Config = require('../src/config.json');

describe('InfoService', () => {
  let bookmarksService: BookmarksService;
  let infoService: InfoService;

  beforeEach(() => {
    const log = () => {};
    bookmarksService = new BookmarksService(null, log);
    infoService = new InfoService(bookmarksService as BookmarksService, log);
    
    sinon.stub(bookmarksService, 'isAcceptingNewSyncs').returns(Promise.resolve(true));    
  });

  afterEach(() => {
    (bookmarksService.isAcceptingNewSyncs as sinon.SinonStub).restore();
  });

  it('getInfo: should return max sync size set in config settings', async () => {
    const maxSyncSizeTestVal = 1;
    Config.maxSyncSize = maxSyncSizeTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.maxSyncSize).to.equal(maxSyncSizeTestVal);
  });

  it('getInfo: should return message set in config settings', async () => {
    const messageTestVal = 'Test API message';
    Config.status.message = messageTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.message).to.equal(messageTestVal);
  });

  it('getInfo: should return correct API status when online', async () => {
    const statusOnlineTestVal = true;
    Config.status.online = statusOnlineTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.status).to.equal(ApiStatus.online);
  });

  it('getInfo: should return correct API status when offline', async () => {
    const statusOfflineTestVal = false;
    Config.status.online = statusOfflineTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.status).to.equal(ApiStatus.offline);
  });

  it('getInfo: should return version set in config settings', async () => {
    const versionTestVal = '0.0.0';
    Config.version = versionTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.version).to.equal(versionTestVal);
  });
});