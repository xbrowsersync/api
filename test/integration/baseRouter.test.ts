import { expect, request, use } from 'chai';
import chaiHttp = require('chai-http');
import decache = require('decache');
import 'mocha';
import * as sinon from 'sinon';
import Config from '../../src/config';
import {
  UnsupportedVersionException
} from '../../src/exception';
import Server from '../../src/server';

before(() => {
  use(chaiHttp);
});

describe('BaseRouter', () => {
  let sandbox: sinon.SinonSandbox;
  let server: Server;
  let testConfig: any;

  beforeEach(async () => {
    testConfig = {
      ...require('../../config/settings.json'),
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
    decache('../../config/settings.json');
    decache('../../config/version.json');
  });

  it('Should return an UnsupportedVersionException error code when requested api version is not supported', async () => {
    await new Promise((resolve) => {
      request(server.getApplication())
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