import { assert, expect } from 'chai';
import decache = require('decache');
import { Request } from 'express';
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/config';
import BookmarksService from '../../src/bookmarksService';
import InfoService from '../../src/infoService';
import { ApiStatus } from '../../src/server';

describe('InfoService', () => {
  let bookmarksService: BookmarksService;
  let infoService: InfoService;
  let sandbox: sinon.SinonSandbox;
  let testConfig: any;

  beforeEach(() => {
    testConfig = {
      ...require('../../config/settings.json'),
      ...require('../../config/version.json')
    };
    const log = () => { };
    bookmarksService = new BookmarksService(null, log);
    infoService = new InfoService(bookmarksService as BookmarksService, log);
    sandbox = sinon.sandbox.create();
    sandbox.stub(Config, 'get').returns(testConfig);
    sandbox.stub(bookmarksService, 'isAcceptingNewSyncs').returns(Promise.resolve(true));
  });

  afterEach(() => {
    sandbox.restore();
    decache('../../config/settings.json');
    decache('../../config/version.json');
  });

  it('getInfo: should return max sync size config value', async () => {
    const maxSyncSizeTestVal = 1;
    testConfig.maxSyncSize = maxSyncSizeTestVal;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.maxSyncSize).to.equal(maxSyncSizeTestVal);
  });

  it('getInfo: should return message config value', async () => {
    const messageTestVal = 'Test API message';
    testConfig.status.message = messageTestVal;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.message).to.equal(messageTestVal);
  });

  it('getInfo: should return correct API status when online', async () => {
    testConfig.status.online = true;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.status).to.equal(ApiStatus.online);
  });

  it('getInfo: should return correct API status when offline', async () => {
    testConfig.status.online = false;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.status).to.equal(ApiStatus.offline);
  });

  it('getInfo: should return version config value', async () => {
    const versionTestVal = '0.0.0';
    testConfig.version = versionTestVal;
    const req: Partial<Request> = {};

    const response = await infoService.getInfo(req as Request);
    expect(response.version).to.equal(versionTestVal);
  });
});