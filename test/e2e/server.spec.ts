import 'jest';
import express from 'express';
import http from 'http';
import https from 'https';
import request from 'supertest';
import * as Config from '../../src/config';
import * as Server from '../../src/server';
import { InfoService } from '../../src/services/info.service';

describe('Server', () => {
  let app: express.Express;
  let service: http.Server | https.Server;
  let testConfig: Config.IConfigSettings;

  beforeEach(async () => {
    testConfig = Config.get(true);
    testConfig.log.file.enabled = false;
    testConfig.log.stdout.enabled = false;
    testConfig.db.name = testConfig.tests.db;
    testConfig.server.port = testConfig.tests.port;
    app = await Server.createApplication();
    service = await Server.startService(app);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await Server.stopService(service);
  });

  it('Should return an 500 status code when generic error occurs', async () => {
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    jest.spyOn(InfoService.prototype, 'getInfo').mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json');
    expect(response.status).toBe(500);
  });

  it('Should return a 404 status code for an invalid route', async () => {
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    const response = await request(app)
      .get(`${Config.get().server.relativePath}bookmarks`)
      .set('content-type', 'application/json');
    expect(response.status).toBe(404);
  });

  it('Should return a 500 status code when requested api version is not supported', async () => {
    await Server.stopService(service);
    testConfig.allowedOrigins = ['http://test.com'];
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    app = await Server.createApplication();
    service = await Server.startService(app);
    const response = await request(app)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json');
    expect(response.status).toBe(500);
  });

  it('Should return a 429 status code when request throttling is triggered', async () => {
    await Server.stopService(service);
    testConfig.throttle.maxRequests = 1;
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    app = await Server.createApplication();
    service = await Server.startService(app);
    await request(app).get(`${Config.get().server.relativePath}info`).set('content-type', 'application/json');
    const response = await request(app)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json');
    expect(response.status).toBe(429);
  });

  it('Should return an 412 status code when requested api version is not supported', async () => {
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    const response = await request(app)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json')
      .set('accept-version', '0.0.0');
    expect(response.status).toBe(412);
  });
});
