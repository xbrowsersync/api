import { expect, request, use } from 'chai';
import chaiHttp = require('chai-http');
import decache = require('decache');
import 'mocha';
import * as sinon from 'sinon';

import Config from '../../src/core/config';
import {
  NotImplementedException,
  OriginNotPermittedException,
  RequestThrottledException,
  UnsupportedVersionException
} from '../../src/core/exception';
import Server from '../../src/core/server';

before(() => {
  use(chaiHttp);
});

after(() => {
  setTimeout(() => {
    process.exit(0);
  }, 100);
});

describe('Server', () => {
  let sandbox: sinon.SinonSandbox;
  let server: Server;
  let testConfig: any;

  beforeEach(async () => {
    testConfig = {
      ...require('../../config/settings.default.json'),
      ...require('../../config/version.json')
    };    
    testConfig.db.name = `${testConfig.db.name}test`;
    testConfig.log.enabled = false;
    sandbox = sinon.createSandbox();
    sandbox.stub(Config, 'get').returns(testConfig);

    server = new Server();
    server.logToConsoleEnabled(false);
    await server.init();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
    sandbox.restore();
    decache('../../config/settings.default.json');
    decache('../../config/version.json');
  });

  it('Should return a NotImplementedException error code for an invalid route', async () => {
    await new Promise((resolve) => {
      request(server.Application)
        .get('/bookmarks')
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.have.status((new NotImplementedException()).status);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          resolve();
        });
    });
  });

  it('Should return an OriginNotPermittedException error code when requested api version is not supported', async () => {
    await server.stop();
    testConfig.allowedOrigins = ['http://test.com'];
    server = new Server();
    server.logToConsoleEnabled(false);
    await server.init();
    await server.start();

    await new Promise((resolve) => {
      request(server.Application)
        .get('/info')
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.have.status((new OriginNotPermittedException()).status);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          resolve();
        });
    });
  });

  it('Should return a RequestThrottledException error code when request throttling is triggered', async () => {
    await server.stop();
    testConfig.throttle.maxRequests = 1;
    server = new Server();
    server.logToConsoleEnabled(false);
    await server.init();
    await server.start();

    await new Promise((resolve) => {
      request(server.Application)
        .get('/info')
        .set('content-type', 'application/json')
        .end((err, res) => {
          resolve();
        });
    });

    await new Promise((resolve) => {
      request(server.Application)
        .get('/info')
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.have.status((new RequestThrottledException()).status);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          resolve();
        });
    });
  });

  it('Should return an UnsupportedVersionException error code when requested api version is not supported', async () => {
    await new Promise((resolve) => {
      request(server.Application)
        .get('/info')
        .set('content-type', 'application/json')
        .set('accept-version', '0.0.0')
        .end((err, res) => {
          expect(res).to.have.status((new UnsupportedVersionException()).status);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          resolve();
        });
    });
  });
});