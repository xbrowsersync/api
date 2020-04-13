// tslint:disable:no-unused-expression

import { expect, request, use } from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/config';
import Server from '../../src/server';
import InfoService from '../../src/services/info.service';

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

  it('Should return an 500 status code when generic error occurs', async () => {
    sandbox.stub(Config, 'get').returns(testConfig);
    sandbox.stub(InfoService.prototype, 'getInfo').throwsException();

    await new Promise((resolve) => {
      request(server.Application)
        .get(`${Config.get().server.relativePath}info`)
        .set('content-type', 'application/json')
        .set('accept-version', '0.0.0')
        .end((err, res) => {
          expect(res.status).to.equal(412);
          resolve();
        });
    });
  });

  it('Should return a 404 status code for an invalid route', async () => {
    sandbox.stub(Config, 'get').returns(testConfig);

    await new Promise((resolve) => {
      request(server.Application)
        .get(`${Config.get().server.relativePath}bookmarks`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.have.status(404);
          resolve();
        });
    });
  });

  it('Should return a 500 status code when requested api version is not supported', async () => {
    await server.stop();
    testConfig.allowedOrigins = ['http://test.com'];
    sandbox.stub(Config, 'get').returns(testConfig);
    server = new Server();
    await server.init();
    await server.start();

    await new Promise((resolve) => {
      request(server.Application)
        .get(`${Config.get().server.relativePath}info`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.have.status(500);
          resolve();
        });
    });
  });

  it('Should return a 429 status code when request throttling is triggered', async () => {
    await server.stop();
    testConfig.throttle.maxRequests = 1;
    sandbox.stub(Config, 'get').returns(testConfig);
    server = new Server();
    await server.init();
    await server.start();

    await new Promise((resolve) => {
      request(server.Application)
        .get(`${Config.get().server.relativePath}info`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          resolve();
        });
    });

    await new Promise((resolve) => {
      request(server.Application)
        .get(`${Config.get().server.relativePath}info`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.have.status(429);
          resolve();
        });
    });
  });

  it('Should return an 412 status code when requested api version is not supported', async () => {
    sandbox.stub(Config, 'get').returns(testConfig);

    await new Promise((resolve) => {
      request(server.Application)
        .get(`${Config.get().server.relativePath}info`)
        .set('content-type', 'application/json')
        .set('accept-version', '0.0.0')
        .end((err, res) => {
          expect(res.status).to.equal(412);
          resolve();
        });
    });
  });
});