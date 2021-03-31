import 'jest';
import { ApiService } from './api.service';

describe('ApiService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ApiService: constructor should initialise service and log', async () => {
    const logTest = {};
    const serviceTest = {};
    const apiService = new ApiService(serviceTest, logTest as any);
    expect(apiService).not.toBeNull();
    expect(apiService.service).toBe(serviceTest);
    expect(apiService.log).toBe(logTest);
  });
});
