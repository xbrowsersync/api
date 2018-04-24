import { assert, expect } from 'chai';
import decache = require('decache');
import { Request } from 'express';
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/config';
import { ServiceNotAvailableException } from '../../src/exception';
import Server from '../../src/server';

describe('Server', () => {
  let sandbox: sinon.SinonSandbox;
  let testConfig: any;

  beforeEach(() => {
    testConfig = {
      ...require('../../config/settings.default.json'),
      ...require('../../config/version.json')
    };
    sandbox = sinon.sandbox.create();
    sandbox.stub(Config, 'get').returns(testConfig);
  });
  
  afterEach(() => {
    sandbox.restore();
    decache('../../config/settings.default.json');
    decache('../../config/version.json');
  });

  it('checkServiceAvailability: should not throw an error when status set as online in config settings', done => {
    testConfig.status.online = true;

    try {
      Server.checkServiceAvailability();
    }
    catch (err) {
      assert.fail();
    }

    done();
  });

  it('checkServiceAvailability: should throw a ServiceNotAvailableException when status set as offline in config settings', done => {
    testConfig.status.online = false;

    try {
      Server.checkServiceAvailability();
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(ServiceNotAvailableException);
    }

    done();
  });
});