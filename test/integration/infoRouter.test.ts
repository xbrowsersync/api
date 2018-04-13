import { expect, request, use } from 'chai';
import chaiHttp = require('chai-http');
import decache = require('decache');
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/config';
import Server from '../../src/server';

let server: Server;

before(() => {
  use(chaiHttp);
});

describe('InfoRouter', () => {
  let sandbox: sinon.SinonSandbox;
  let server: Server;
  let testConfig: any;

  beforeEach(async () => {
    testConfig = require('../../config/config.json');
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
    decache('../../config/config.json');
  });

  it('GET info: should return api status info', async () => {
    await new Promise((resolve) => {
      request(server.getApplication())
        .get('/info')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          resolve();
        });
    });
  });
});