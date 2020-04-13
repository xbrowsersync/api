import * as countryList from 'country-list';

export function getCountryNameFromLocationCode(locationCode: string): string {
  if (!locationCode) {
    return null;
  }

  return countryList.getName(locationCode);
}

export function setCountryNames(): void {
  countryList.overwrite([{
    code: 'GB',
    name: 'United Kingdom'
  }]);
}

export function validateLocationCode(locationCode: string): boolean {
  if (!locationCode) {
    return true;
  }

  const countryName = countryList.getName(locationCode);
  if (!countryName) {
    return false
  }

  return true;
}