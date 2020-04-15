// tslint:disable:no-unused-expression

import 'jest';
import * as Config from './config';

describe('Config', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('get: should return default settings values when no user settings provided', () => {
    jest.spyOn(Config, 'getUserSettings').mockImplementation(() => { return {}; });
    const maxSyncs = Config.getConfig(true).maxSyncs;
    expect(maxSyncs).toBe(5242);
  });

  it('get: should return user settings values when user settings provided', () => {
    const maxSyncsTestVal = 9999;
    jest.spyOn(Config, 'getUserSettings').mockReturnValue({
      maxSyncs: maxSyncsTestVal
    });
    const maxSyncs = Config.getConfig(true).maxSyncs;
    expect(maxSyncs).toEqual(maxSyncsTestVal);
  });

  it('get: should return package version number', () => {
    const versionTestVal = '1.1.1';
    jest.spyOn(Config, 'getPackageVersion').mockReturnValue(versionTestVal);
    const version = Config.getConfig(true).version;
    expect(version).toEqual(versionTestVal);
  });
});