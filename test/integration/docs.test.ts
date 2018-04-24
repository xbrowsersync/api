import { expect, request, use } from 'chai';
import chaiHttp = require('chai-http');
import decache = require('decache');
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/config';
import Server from '../../src/server';

before(() => {
  use(chaiHttp);
});

describe('Docs', () => {
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
    sandbox = sinon.sandbox.create();
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

  it('GET /: Should return a 200 code', async () => {
    await new Promise((resolve) => {
      request(server.getApplication())
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