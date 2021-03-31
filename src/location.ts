import { getName, overwrite } from 'country-list';

export const getCountryNameFromLocationCode = (locationCode: string): string => {
  if (!locationCode) {
    return null;
  }

  return getName(locationCode);
};

export const setCountryNames = (): void => {
  overwrite([
    {
      code: 'GB',
      name: 'United Kingdom',
    },
  ]);
};

export const validateLocationCode = (locationCode: string): boolean => {
  if (!locationCode) {
    return true;
  }

  const countryName = getName(locationCode);
  if (!countryName) {
    return false;
  }

  return true;
};
