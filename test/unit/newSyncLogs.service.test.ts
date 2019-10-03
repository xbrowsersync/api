import { expect } from 'chai';
import { Request } from 'express';
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/core/config';
import { ClientIpAddressEmptyException } from '../../src/core/exception';
import NewSyncLogsModel from '../../src/models/newSyncLogs.model';
import NewSyncLogsService from '../../src/services/newSyncLogs.service';

describe('NewSyncLogsService', () => {
  const testClientIPAddress = '123.456.789.0';
  let newSyncLogsService: NewSyncLogsService;
  let sandbox: sinon.SinonSandbox;
  let testConfig: any;

  beforeEach(() => {
    testConfig = Config.get(true);
    const log = () => null;
    newSyncLogsService = new NewSyncLogsService(null, log);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('createLog: should create a new sync log using the request IP address', async () => {
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
    sandbox.stub(Config, 'get').returns(testConfig);
    const countStub = sandbox.stub(NewSyncLogsModel, 'countDocuments').returns({
      exec: () => Promise.resolve(dailyNewSyncsLimitTestVal)
    } as any);

    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(countStub.called).to.be.true;
    expect(limitHit).to.equal(true);
  });

  it('newSyncsLimitHit: should return false if the request IP address has not hit the limit for daily new syncs created', async () => {
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };
    testConfig.dailyNewSyncsLimit = 3;
    sandbox.stub(Config, 'get').returns(testConfig);
    const countStub = sandbox.stub(NewSyncLogsModel, 'countDocuments').returns({
      exec: () => Promise.resolve(1)
    } as any);

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