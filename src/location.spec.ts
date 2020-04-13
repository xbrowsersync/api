// tslint:disable:no-unused-expression

import { assert, expect } from 'chai';
import 'mocha';
import * as Location from './location';

describe('Location', () => {
  const invalidLocationCode = 'AA';

  it('getCountryNameFromLocationCode: should return null if no location code provided', () => {
    const countryName = Location.getCountryNameFromLocationCode(null);
    expect(countryName).to.be.null;
  });

  it('getCountryNameFromLocationCode: should return undefined if location code is invalid', () => {
    const countryName = Location.getCountryNameFromLocationCode(invalidLocationCode);
    expect(countryName).to.be.undefined;
  });

  it('getCountryNameFromLocationCode: should return correct country name for a valid location code', () => {
    const locationCode = 'GB';
    const countryName = Location.getCountryNameFromLocationCode(locationCode);
    expect(countryName).to.contain('United Kingdom');
  });

  it('setCountryNames: should update country names to the correct values', () => {
    const locationCode = 'GB';
    Location.setCountryNames();
    const countryName = Location.getCountryNameFromLocationCode(locationCode);
    expect(countryName).to.equal('United Kingdom');
  });

  it('validateLocationCode: should return true if no location code provided', () => {
    const isValid = Location.validateLocationCode(null);
    expect(isValid).to.be.true;
  });

  it('validateLocationCode: should return false if invalid location code provided', () => {
    const isValid = Location.validateLocationCode(invalidLocationCode);
    expect(isValid).to.be.false;
  });

  it('validateLocationCode: should return true if valid location code provided', () => {
    const isValid = Location.validateLocationCode('GB');
    expect(isValid).to.be.true;
  });
});