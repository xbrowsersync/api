"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("deepmerge");
const fs = require("fs");
const path = require("path");
let config;
exports.getConfig = (force) => {
    if (config && !force) {
        return config;
    }
    // Get full path to config folder
    const pathToConfig = path.join(__dirname, '../config');
    // Get default settings values
    const defaultSettings = getDefaultSettings(pathToConfig);
    // Get user settings values if present
    const userSettings = exports.getUserSettings(pathToConfig);
    // Merge default and user settings
    const settings = merge(defaultSettings, userSettings);
    // Get current version number
    const version = exports.getPackageVersion();
    config = Object.assign(Object.assign({}, settings), { version });
    return config;
};
const getDefaultSettings = (pathToConfig) => {
    const pathToSettings = path.join(pathToConfig, 'settings.default.json');
    return require(pathToSettings);
};
exports.getPackageVersion = () => {
    const packageJson = require('../package.json');
    return packageJson.version;
};
exports.getUserSettings = (pathToConfig) => {
    const pathToUserSettings = path.join(pathToConfig, 'settings.json');
    let userSettings = {};
    if (fs.existsSync(pathToUserSettings)) {
        userSettings = require(pathToUserSettings);
    }
    return userSettings;
};
//# sourceMappingURL=config.js.map