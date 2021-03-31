import 'jest';
import express from 'express';
import http from 'http';
import https from 'https';
import request from 'supertest';
import { ServiceStatus } from '../../src/common/enums';
import * as Config from '../../src/config';
import * as Server from '../../src/server';

describe('InfoRouter', () => {
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

  it('GET info: should return api status info', async () => {
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    const response = await request(app).get(`${Config.get().server.relativePath}info`);
    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');
    expect(response.body.status).toStrictEqual(ServiceStatus.online);
  });
});
