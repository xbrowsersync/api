import 'jest';
import { getCountryNameFromLocationCode, setCountryNames, validateLocationCode } from './location';

describe('Location', () => {
  const invalidLocationCode = 'AA';

  it('getCountryNameFromLocationCode: should return null if no location code provided', () => {
    const countryName = getCountryNameFromLocationCode(null);
    expect(countryName).toBeNull();
  });

  it('getCountryNameFromLocationCode: should return undefined if location code is invalid', () => {
    const countryName = getCountryNameFromLocationCode(invalidLocationCode);
    expect(countryName).toBeUndefined();
  });

  it('getCountryNameFromLocationCode: should return correct country name for a valid location code', () => {
    const locationCode = 'GB';
    const countryName = getCountryNameFromLocationCode(locationCode);
    expect(countryName).toContain('United Kingdom');
  });

  it('setCountryNames: should update country names to the correct values', () => {
    const locationCode = 'GB';
    setCountryNames();
    const countryName = getCountryNameFromLocationCode(locationCode);
    expect(countryName).toBe('United Kingdom');
  });

  it('validateLocationCode: should return true if no location code provided', () => {
    const isValid = validateLocationCode(null);
    expect(isValid).toBe(true);
  });

  it('validateLocationCode: should return false if invalid location code provided', () => {
    const isValid = validateLocationCode(invalidLocationCode);
    expect(isValid).toBe(false);
  });

  it('validateLocationCode: should return true if valid location code provided', () => {
    const isValid = validateLocationCode('GB');
    expect(isValid).toBe(true);
  });
});
