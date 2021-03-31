import 'jest';
import * as Config from '../config';
import { ServiceNotAvailableException } from '../exception';
import { checkServiceAvailability } from './utils';

describe('Server', () => {
  let testConfig: Config.IConfigSettings;

  beforeEach(() => {
    testConfig = Config.get(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('checkServiceAvailability: should not throw an error when status set as online in config settings', () => {
    testConfig.status.online = true;
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    expect(() => {
      checkServiceAvailability();
    }).not.toThrowError();
  });

  it('checkServiceAvailability: should throw a ServiceNotAvailableException when status set as offline in config settings', () => {
    testConfig.status.online = false;
    jest.spyOn(Config, 'get').mockImplementation(() => {
      return testConfig;
    });
    expect(() => {
      checkServiceAvailability();
    }).toThrow(ServiceNotAvailableException);
  });
});
