// tslint:disable:no-empty
// tslint:disable:no-unused-expression

import 'jest';
import * as request from 'supertest';
import Config from '../../src/config';
import Server from '../../src/server';
import InfoService from '../../src/services/info.service';

describe('Server', () => {
  let server: Server;
  let testConfig: any;

  beforeEach(async () => {
    testConfig = Config.get(true);
    testConfig.log.file.enabled = false;
    testConfig.log.stdout.enabled = false;
    testConfig.db.name = testConfig.tests.db;
    testConfig.server.port = testConfig.tests.port;
    server = new Server();
    await server.init();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('Should return an 500 status code when generic error occurs', async () => {
    const getSpy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const getInfoSpy = jest.spyOn(InfoService.prototype, 'getInfo').mockImplementation(() => {
      throw new Error();
    });
    const response = await request(server.Application)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json');
    expect(response.status).toBe(500);
    getSpy.mockRestore();
    getInfoSpy.mockRestore();
  });

  it('Should return a 404 status code for an invalid route', async () => {
    const getSpy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await request(server.Application)
      .get(`${Config.get().server.relativePath}bookmarks`)
      .set('content-type', 'application/json');
    expect(response.status).toBe(404);
    getSpy.mockRestore();
  });

  it('Should return a 500 status code when requested api version is not supported', async () => {
    await server.stop();
    testConfig.allowedOrigins = ['http://test.com'];
    const getSpy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    server = new Server();
    await server.init();
    await server.start();
    const response = await request(server.Application)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json');
    expect(response.status).toBe(500);
    getSpy.mockRestore();
  });

  it('Should return a 429 status code when request throttling is triggered', async () => {
    await server.stop();
    testConfig.throttle.maxRequests = 1;
    const getSpy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    server = new Server();
    await server.init();
    await server.start();
    await request(server.Application)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json');
    const response = await request(server.Application)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json');
    expect(response.status).toBe(429);
    getSpy.mockRestore();
  });

  it('Should return an 412 status code when requested api version is not supported', async () => {
    const getSpy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);
    const response = await request(server.Application)
      .get(`${Config.get().server.relativePath}info`)
      .set('content-type', 'application/json')
      .set('accept-version', '0.0.0');
    expect(response.status).toBe(412);
    getSpy.mockRestore();
  });
});