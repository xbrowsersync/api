import { expect, request, use } from 'chai';
import chaiHttp = require('chai-http');
import decache = require('decache');
import 'mocha';
import * as sinon from 'sinon';

import Config from '../../src/core/config';
import Server from '../../src/core/server';

before(() => {
  use(chaiHttp);
});

describe('Docs', () => {
  let sandbox: sinon.SinonSandbox;
  let server: Server;
  let testConfig: any;

  beforeEach(async () => {
    testConfig = Config.get(true);
    testConfig.log.enabled = false;
    testConfig.db.name = testConfig.tests.db;
    testConfig.server.port = testConfig.tests.port;
    sandbox = sinon.createSandbox();

    server = new Server();
    server.logToConsoleEnabled(false);
    await server.init();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
    sandbox.restore();
  });

  it('GET /: Should return a 200 code', async () => {
    sandbox.stub(Config, 'get').returns(testConfig);

    await new Promise((resolve) => {
      request(server.Application)
        .get('/')
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          resolve();
        });
    });
  });
});