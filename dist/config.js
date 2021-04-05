"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSettings = exports.getPackageVersion = exports.get = exports.setCachedConfig = exports.getCachedConfig = void 0;
const deepmerge_1 = __importDefault(require("deepmerge"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let cachedConfig;
const getCachedConfig = () => {
    return cachedConfig;
};
exports.getCachedConfig = getCachedConfig;
const setCachedConfig = (value) => {
    cachedConfig = value;
};
exports.setCachedConfig = setCachedConfig;
// Returns combined default and user-specified config settings
const get = (force) => {
    if (exports.getCachedConfig() && !force) {
        return exports.getCachedConfig();
    }
    // Get full path to config folder
    const pathToConfig = path_1.default.join(__dirname, '../config');
    // Get default settings values
    const defaultSettings = getDefaultSettings(pathToConfig);
    // Get user settings values if present
    const userSettings = exports.getUserSettings(pathToConfig);
    // Merge default and user settings
    const settings = deepmerge_1.default(defaultSettings, userSettings);
    // Get current version number
    const version = exports.getPackageVersion();
    exports.setCachedConfig(Object.assign(Object.assign({}, settings), { version }));
    return exports.getCachedConfig();
};
exports.get = get;
// Returns default config settings
const getDefaultSettings = (pathToConfig) => {
    const pathToSettings = path_1.default.join(pathToConfig, 'settings.default.json');
    return require(pathToSettings);
};
// Returns version number from package.json
const getPackageVersion = () => {
    const packageJson = require('../package.json');
    return packageJson.version;
};
exports.getPackageVersion = getPackageVersion;
// Returns user-specified config settings
const getUserSettings = (pathToConfig) => {
    const pathToUserSettings = path_1.default.join(pathToConfig, 'settings.json');
    let userSettings = {};
    if (fs_1.default.existsSync(pathToUserSettings)) {
        userSettings = require(pathToUserSettings);
    }
    return userSettings;
};
exports.getUserSettings = getUserSettings;
