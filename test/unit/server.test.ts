// tslint:disable:no-unused-expression

import { assert, expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/core/config';
import { ServiceNotAvailableException } from '../../src/core/exception';
import Server from '../../src/core/server';

describe('Server', () => {
  let sandbox: sinon.SinonSandbox;
  let testConfig: any;

  beforeEach(() => {
    testConfig = Config.get(true);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('checkServiceAvailability: should not throw an error when status set as online in config settings', done => {
    testConfig.status.online = true;
    sandbox.stub(Config, 'get').returns(testConfig);

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
    sandbox.stub(Config, 'get').returns(testConfig);

    try {
      Server.checkServiceAvailability();
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(ServiceNotAvailableException);
    }

    done();
  });
});