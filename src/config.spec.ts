// tslint:disable:no-unused-expression

import 'jest';
import Config from './config';

describe('Config', () => {
  it('get: should return default settings values when no user settings provided', () => {
    const spy = jest.spyOn(Config, 'getUserSettings').mockReturnValue({});
    const maxSyncs = Config.get(true).maxSyncs;
    expect(maxSyncs).toBe(5242);
    spy.mockRestore();
  });

  it('get: should return user settings values when user settings provided', () => {
    const maxSyncsTestVal = 9999;
    const spy = jest.spyOn(Config, 'getUserSettings').mockReturnValue({
      maxSyncs: maxSyncsTestVal
    });
    const maxSyncs = Config.get(true).maxSyncs;
    expect(maxSyncs).toEqual(maxSyncsTestVal);
    spy.mockRestore();
  });

  it('get: should return package version number', () => {
    const versionTestVal = '1.1.1';
    const spy = jest.spyOn(Config, 'getPackageVersion').mockReturnValue(versionTestVal);
    const version = Config.get(true).version;
    expect(version).toEqual(versionTestVal);
    spy.mockRestore();
  });
});