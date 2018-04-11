import { assert, expect } from 'chai';
import { Request } from 'express';
import 'mocha';
import * as sinon from 'sinon';
import { ServiceNotAvailableException } from '../src/exception';
import Server from '../src/server';
const Config = require('../src/config.json');

describe('Server', () => {
  afterEach(() => {
    Config.status.online = true;
  });

  it('checkServiceAvailability: should not throw an error when status set as online in config settings', done => {
    Config.status.online = true;

    try {
      Server.checkServiceAvailability();
    }
    catch (err) {
      assert.fail();
    }

    done();
  });

  it('checkServiceAvailability: should throw a ServiceNotAvailableException when status set as offline in config settings', done => {
    Config.status.online = false;

    try {
      Server.checkServiceAvailability();
    }
    catch (err) {
      expect(err).to.be.an.instanceOf(ServiceNotAvailableException);
    }

    done();
  });
});