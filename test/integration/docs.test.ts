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
    const { version } = require('../../package.json');
    testConfig = {
      ...require('../../config/settings.default.json'),
      version
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
  });

  it('GET /: Should return a 200 code', async () => {
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