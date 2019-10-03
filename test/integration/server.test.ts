import { expect, request, use } from 'chai';
import chaiHttp = require('chai-http');
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
    testConfig = Config.get(true);
    testConfig.log.file.enabled = false;
    testConfig.log.stdout.enabled = false;
    testConfig.db.name = testConfig.tests.db;
    testConfig.server.port = testConfig.tests.port;
    sandbox = sinon.createSandbox();

    server = new Server();
    await server.init();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
    sandbox.restore();
  });

  it('Should return a NotImplementedException error code for an invalid route', async () => {
    sandbox.stub(Config, 'get').returns(testConfig);

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
    sandbox.stub(Config, 'get').returns(testConfig);
    server = new Server();
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
    sandbox.stub(Config, 'get').returns(testConfig);
    server = new Server();
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
    sandbox.stub(Config, 'get').returns(testConfig);

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