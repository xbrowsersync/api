"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const countryList = require("country-list");
function getCountryNameFromLocationCode(locationCode) {
    if (!locationCode) {
        return null;
    }
    return countryList.getName(locationCode);
}
exports.getCountryNameFromLocationCode = getCountryNameFromLocationCode;
function setCountryNames() {
    countryList.overwrite([{
            code: 'GB',
            name: 'United Kingdom'
        }]);
}
exports.setCountryNames = setCountryNames;
function validateLocationCode(locationCode) {
    if (!locationCode) {
        return true;
    }
    const countryName = countryList.getName(locationCode);
    if (!countryName) {
        return false;
    }
    return true;
}
exports.validateLocationCode = validateLocationCode;
//# sourceMappingURL=location.js.map