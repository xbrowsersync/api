import { assert, expect } from 'chai';
import decache = require('decache');
import { Request } from 'express';
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/config';
import { ClientIpAddressEmptyException } from '../../src/exception';
import NewSyncLogsModel from '../../src/newSyncLogsModel';
import NewSyncLogsService from '../../src/newSyncLogsService';

describe('NewSyncLogsService', () => {
  const testClientIPAddress = '123.456.789.0';
  let newSyncLogsService: NewSyncLogsService;
  let sandbox: sinon.SinonSandbox;
  let testConfig: any;

  beforeEach(() => {
    testConfig = {
      ...require('../../config/settings.json'),
      ...require('../../config/version.json')
    };
    const log = () => { };
    newSyncLogsService = new NewSyncLogsService(null, log);
    sandbox = sinon.sandbox.create();
    sandbox.stub(Config, 'get').returns(testConfig);
  });

  afterEach(() => {
    sandbox.restore();
    decache('../../config/settings.json');
    decache('../../config/version.json');
  });

  it('createLog: should create a new sync log using the request IP address', async () => {
    const testClientIPAddress = '123.456.789.0';
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };

    const saveStub = sandbox.stub(NewSyncLogsModel.prototype, 'save');
    const savedTestLog = await newSyncLogsService.createLog(req as Request);

    expect(saveStub.called).to.be.true;
    expect(savedTestLog.ipAddress).to.equal(testClientIPAddress);
  });

  it('createLog: should throw a ClientIpAddressEmptyException if the request IP address could not be ascertained', async () => {
    const req: Partial<Request> = {};

    try {
      await newSyncLogsService.createLog(req as Request);
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(ClientIpAddressEmptyException);
    }
  });

  it('newSyncsLimitHit: should return true if the request IP address has hit the limit for daily new syncs created', async () => {
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };
    const dailyNewSyncsLimitTestVal = 1;
    testConfig.dailyNewSyncsLimit = dailyNewSyncsLimitTestVal;

    const countStub = sandbox.stub(NewSyncLogsModel, 'count').returns({
      exec: () => Promise.resolve(dailyNewSyncsLimitTestVal)
    });

    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(countStub.called).to.be.true;
    expect(limitHit).to.equal(true);
  });

  it('newSyncsLimitHit: should return false if the request IP address has not hit the limit for daily new syncs created', async () => {
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };
    testConfig.dailyNewSyncsLimit = 3;

    const countStub = sandbox.stub(NewSyncLogsModel, 'count').returns({
      exec: () => Promise.resolve(1)
    });

    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(countStub.called).to.be.true;
    expect(limitHit).to.equal(false);
  });

  it('newSyncsLimitHit: should throw a ClientIpAddressEmptyException if the request IP address could not be ascertained', async () => {
    const req: Partial<Request> = {};

    try {
      await newSyncLogsService.newSyncsLimitHit(req as Request);
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(ClientIpAddressEmptyException);
    }
  });
});