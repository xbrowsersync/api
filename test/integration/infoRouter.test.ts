import { expect, request, use } from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';
import * as sinon from 'sinon';
import Server from '../../src/server';
const Config = require('../../src/config.json');

let server: Server;

before(async () => {
  use(chaiHttp);
});

describe('InfoRouter', () => {
  beforeEach(async () => {
    server = new Server();
    server.logToConsoleEnabled(false);
    await server.init();
    await server.start();
  });
  
  afterEach(async () => {
    await server.stop();
  });
  
  it('/GET info: should return api status info', done => {
    request(server.getApplication())
      .get('/info')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        done();
      });
  });
});