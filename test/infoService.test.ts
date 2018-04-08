import { expect } from 'chai';
import { Express, Response, Request } from 'express';
import 'mocha';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
import BookmarksService from '../src/bookmarksService';
import InfoService from '../src/infoService';
import { ApiStatus } from '../src/server';
const Config = require('../src/config.json');

describe('Info Service', () => {
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

  it('Should return max sync size set in config settings', async () => {
    const maxSyncSizeTestVal = 1;
    Config.maxSyncSize = maxSyncSizeTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.maxSyncSize).to.eq(maxSyncSizeTestVal);
  });

  it('Should return message set in config settings', async () => {
    const messageTestVal = 'Test API message';
    Config.status.message = messageTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.message).to.eq(messageTestVal);
  });

  it('Should return correct API status when online', async () => {
    const statusOnlineTestVal = true;
    Config.status.online = statusOnlineTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.status).to.eq(ApiStatus.online);
  });

  it('Should return correct API status when offline', async () => {
    const statusOfflineTestVal = false;
    Config.status.online = statusOfflineTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.status).to.eq(ApiStatus.offline);
  });

  it('Should return version set in config settings', async () => {
    const versionTestVal = '0.0.0';
    Config.version = versionTestVal;

    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);

    expect(response.version).to.eq(versionTestVal);
  });
});