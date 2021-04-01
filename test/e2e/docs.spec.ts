import 'jest';
import express from 'express';
import http from 'http';
import https from 'https';
import request from 'supertest';
import * as Config from '../../src/config';
import * as Server from '../../src/server';

describe('Docs', () => {
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

  it('GET /: Should return a 200 status code', async () => {
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    const response = await request(app).get(Config.get().server.relativePath);
    expect(response.status).toBe(200);
  });

  it('GET /: Should return HTML content', async () => {
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    const response = await request(app).get(Config.get().server.relativePath);
    expect(response.type).toBe('text/html');
  });
});
