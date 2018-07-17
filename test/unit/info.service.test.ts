import { assert, expect } from 'chai';
import decache = require('decache');
import { Request } from 'express';
import 'mocha';
import * as sinon from 'sinon';

import Config from '../../src/core/config';
import BookmarksService from '../../src/services/bookmarks.service';
import InfoService from '../../src/services/info.service';
import { ApiStatus } from '../../src/core/server';

describe('InfoService', () => {
  let bookmarksService: BookmarksService;
  let infoService: InfoService;
  let sandbox: sinon.SinonSandbox;
  let testConfig: any;

  beforeEach(() => {
    testConfig = Config.get(true);
    const log = () => { };
    bookmarksService = new BookmarksService(null, log);
    infoService = new InfoService(bookmarksService as BookmarksService, log);
    sandbox = sinon.createSandbox();
    sandbox.stub(bookmarksService, 'isAcceptingNewSyncs').returns(Promise.resolve(true));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('getInfo: should return max sync size config value', async () => {
    const req: Partial<Request> = {};
    const maxSyncSizeTestVal = 1;
    testConfig.maxSyncSize = maxSyncSizeTestVal;
    sandbox.stub(Config, 'get').returns(testConfig);

    const response = await infoService.getInfo(req as Request);
    expect(response.maxSyncSize).to.equal(maxSyncSizeTestVal);
  });

  it('getInfo: should return message config value', async () => {
    const req: Partial<Request> = {};
    const messageTestVal = 'Test API message';
    testConfig.status.message = messageTestVal;
    sandbox.stub(Config, 'get').returns(testConfig);

    const response = await infoService.getInfo(req as Request);
    expect(response.message).to.equal(messageTestVal);
  });

  it('getInfo: should strip script tags from message config value', async () => {
    const req: Partial<Request> = {};
    const messageTestVal = `<script>alert('test');</script>`;
    testConfig.status.message = messageTestVal;
    sandbox.stub(Config, 'get').returns(testConfig);

    const response = await infoService.getInfo(req as Request);
    expect(response.message).to.equal('');
  });

  it('getInfo: should return correct API status when online', async () => {
    const req: Partial<Request> = {};
    testConfig.status.online = true;
    sandbox.stub(Config, 'get').returns(testConfig);

    const response = await infoService.getInfo(req as Request);
    expect(response.status).to.equal(ApiStatus.online);
  });

  it('getInfo: should return correct API status when offline', async () => {
    const req: Partial<Request> = {};
    testConfig.status.online = false;
    sandbox.stub(Config, 'get').returns(testConfig);

    const response = await infoService.getInfo(req as Request);
    expect(response.status).to.equal(ApiStatus.offline);
  });

  it('getInfo: should return version config value', async () => {
    const req: Partial<Request> = {};
    const versionTestVal = '0.0.0';
    testConfig.version = versionTestVal;
    sandbox.stub(Config, 'get').returns(testConfig);

    const response = await infoService.getInfo(req as Request);
    expect(response.version).to.equal(versionTestVal);
  });
});