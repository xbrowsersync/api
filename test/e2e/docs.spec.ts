import 'jest';
import * as request from 'supertest';
import * as Config from '../../src/config';
import Server from '../../src/server';

describe('Docs', () => {
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
    jest.restoreAllMocks();
    await server.stop();
  });

  it('GET /: Should return a 200 status code', async () => {
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await request(server.Application)
      .get(Config.get().server.relativePath);
    expect(response.status).toBe(200);
  });

  it('GET /: Should return HTML content', async () => {
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await request(server.Application)
      .get(Config.get().server.relativePath);
    expect(response.type).toBe('text/html');
  });
});