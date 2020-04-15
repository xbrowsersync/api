// tslint:disable:no-unused-expression

import 'jest';
import Config from './config';
import { ServiceNotAvailableException } from './exception';
import Server from './server';

describe('Server', () => {
  let testConfig: any;

  beforeEach(() => {
    testConfig = Config.get(true);
  });

  it('checkServiceAvailability: should not throw an error when status set as online in config settings', () => {
    testConfig.status.online = true;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);

    expect(() => {
      Server.checkServiceAvailability();
    }).not.toThrowError();

    spy.mockRestore();
  });

  it('checkServiceAvailability: should throw a ServiceNotAvailableException when status set as offline in config settings', () => {
    testConfig.status.online = false;
    const spy = jest.spyOn(Config, 'get').mockReturnValue(testConfig);

    expect(() => {
      Server.checkServiceAvailability();
    }).toThrow(ServiceNotAvailableException);

    spy.mockRestore();
  });
});