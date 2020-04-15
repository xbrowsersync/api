// tslint:disable:no-unused-expression

import 'jest';
import * as request from 'supertest';
import * as Config from '../../src/config';
import Server, { ApiStatus } from '../../src/server';

describe('InfoRouter', () => {
  let server: Server;
  let testConfig: any;

  beforeEach(async () => {
    testConfig = Config.getConfig(true);
    testConfig.log.file.enabled = false;
    testConfig.log.stdout.enabled = false;
    testConfig.db.name = testConfig.tests.db;
    testConfig.server.port = testConfig.tests.port;
    server = new Server();
    await server.init();
    await server.start();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await server.stop();
  });

  it('GET info: should return api status info', async () => {
    jest.spyOn(Config, 'getConfig').mockImplementation(() => { return testConfig; });
    const response = await request(server.Application)
      .get(`${Config.getConfig().server.relativePath}info`);
    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');
    expect(response.body.status).toEqual(ApiStatus.online);
  });
});