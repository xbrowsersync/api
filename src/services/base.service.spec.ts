import 'jest';
import BaseService from './base.service';

describe('BaseService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('BaseService: constructor should initialise service and log', async () => {
    const logTest = {};
    const serviceTest = {};
    const baseService = new BaseService(serviceTest, logTest as any);
    expect(baseService).not.toBeNull();
    expect(baseService.service).toBe(serviceTest);
    expect(baseService.log).toBe(logTest);
  });
});