import { assert, expect } from 'chai';
import { Request } from 'express';
import 'mocha';
import * as sinon from 'sinon';
import BookmarksService from '../../src/bookmarksService';
import InfoService from '../../src/infoService';
import { ApiStatus } from '../../src/server';
const Config = require('../../src/config.json');

describe('InfoService', () => {
  let bookmarksService: BookmarksService;
  let infoService: InfoService;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    const log = () => { };
    bookmarksService = new BookmarksService(null, log);
    infoService = new InfoService(bookmarksService as BookmarksService, log);

    sandbox = sinon.sandbox.create();
    sandbox.stub(bookmarksService, 'isAcceptingNewSyncs').returns(Promise.resolve(true));
  });

  afterEach(() => {
    Config.maxSyncSize = 512000;
    Config.status.message = '';
    Config.status.online = true;
    Config.version = '1.1.0';

    sandbox.restore();
  });

  it('getInfo: should return max sync size config value', async () => {
    const maxSyncSizeTestVal = 1;
    Config.maxSyncSize = maxSyncSizeTestVal;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.maxSyncSize).to.equal(maxSyncSizeTestVal);
  });

  it('getInfo: should return message config value', async () => {
    const messageTestVal = 'Test API message';
    Config.status.message = messageTestVal;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.message).to.equal(messageTestVal);
  });

  it('getInfo: should return correct API status when online', async () => {
    Config.status.online = true;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.status).to.equal(ApiStatus.online);
  });

  it('getInfo: should return correct API status when offline', async () => {
    Config.status.online = false;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.status).to.equal(ApiStatus.offline);
  });

  it('getInfo: should return version config value', async () => {
    const versionTestVal = '0.0.0';
    Config.version = versionTestVal;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.version).to.equal(versionTestVal);
  });
});