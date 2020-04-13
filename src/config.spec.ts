// tslint:disable:no-unused-expression

import { assert, expect } from 'chai';
import 'mocha';
import Config from './config';
import * as sinon from 'sinon';

describe('Config', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('get: should return default settings values when no user settings provided', () => {
    sandbox.stub(Config, 'getUserSettings').returns({});
    const maxSyncs = Config.get(true).maxSyncs;
    expect(maxSyncs).to.equal(5242);
  });

  it('get: should return user settings values when user settings provided', () => {
    const maxSyncsTestVal = 9999;
    sandbox.stub(Config, 'getUserSettings').returns({
      maxSyncs: maxSyncsTestVal
    });
    const maxSyncs = Config.get(true).maxSyncs;
    expect(maxSyncs).to.equal(maxSyncsTestVal);
  });

  it('get: should return package version number', () => {
    const versionTestVal = '1.1.1';
    sandbox.stub(Config, 'getPackageVersion').returns(versionTestVal);
    const version = Config.get(true).version;
    expect(version).to.equal(versionTestVal);
  });
});