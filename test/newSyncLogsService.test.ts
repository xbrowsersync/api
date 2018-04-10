import { expect } from 'chai';
import { Express, Response, Request } from 'express';
import 'mocha';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
import { ClientIpAddressEmptyException } from '../src/exception';
import NewSyncLogsModel, { INewSyncLog, INewSyncLogsModel } from '../src/newSyncLogsModel';
import NewSyncLogsService from '../src/newSyncLogsService';
import { ApiStatus } from '../src/server';
const Config = require('../src/config.json');

describe('NewSyncLogsService', () => {
  let newSyncLogsService: NewSyncLogsService;

  beforeEach(() => {
    const log = () => { };
    newSyncLogsService = new NewSyncLogsService(null, log);
  });

  it('createLog: should create a new sync log using the request IP address', async () => {
    const testClientIPAddress = '123.456.789.0';
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };

    const saveStub = sinon.stub(NewSyncLogsModel.prototype, 'save');
    const savedTestLog = await newSyncLogsService.createLog(req as Request);

    sinon.assert.calledOnce(saveStub);
    expect(savedTestLog.ipAddress).to.equal(testClientIPAddress);

    saveStub.restore();
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
    const testClientIPAddress = '123.456.789.0';
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };
    const dailyNewSyncsLimitTestVal = 1;
    Config.dailyNewSyncsLimit = dailyNewSyncsLimitTestVal;

    const countStub = sinon.stub(NewSyncLogsModel, 'count').returns({
      exec: () => Promise.resolve(dailyNewSyncsLimitTestVal)
    });

    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(limitHit).to.equal(true);

    countStub.restore();
  });

  it('newSyncsLimitHit: should return false if the request IP address has not hit the limit for daily new syncs created', async () => {
    const testClientIPAddress = '123.456.789.0';
    const req: Partial<Request> = {
      ip: testClientIPAddress
    };
    const dailyNewSyncsLimitTestVal = 3;
    Config.dailyNewSyncsLimit = dailyNewSyncsLimitTestVal;

    const countStub = sinon.stub(NewSyncLogsModel, 'count').returns({
      exec: () => Promise.resolve(1)
    });

    const limitHit = await newSyncLogsService.newSyncsLimitHit(req as Request);
    expect(limitHit).to.equal(false);

    countStub.restore();
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