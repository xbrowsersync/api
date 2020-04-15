// tslint:disable:no-unused-expression

import 'jest';
import * as Location from './location';

describe('Location', () => {
  const invalidLocationCode = 'AA';

  it('getCountryNameFromLocationCode: should return null if no location code provided', () => {
    const countryName = Location.getCountryNameFromLocationCode(null);
    expect(countryName).toBeNull();
  });

  it('getCountryNameFromLocationCode: should return undefined if location code is invalid', () => {
    const countryName = Location.getCountryNameFromLocationCode(invalidLocationCode);
    expect(countryName).toBeUndefined();
  });

  it('getCountryNameFromLocationCode: should return correct country name for a valid location code', () => {
    const locationCode = 'GB';
    const countryName = Location.getCountryNameFromLocationCode(locationCode);
    expect(countryName).toContain('United Kingdom');
  });

  it('setCountryNames: should update country names to the correct values', () => {
    const locationCode = 'GB';
    Location.setCountryNames();
    const countryName = Location.getCountryNameFromLocationCode(locationCode);
    expect(countryName).toBe('United Kingdom');
  });

  it('validateLocationCode: should return true if no location code provided', () => {
    const isValid = Location.validateLocationCode(null);
    expect(isValid).toBe(true);
  });

  it('validateLocationCode: should return false if invalid location code provided', () => {
    const isValid = Location.validateLocationCode(invalidLocationCode);
    expect(isValid).toBe(false);
  });

  it('validateLocationCode: should return true if valid location code provided', () => {
    const isValid = Location.validateLocationCode('GB');
    expect(isValid).toBe(true);
  });
});