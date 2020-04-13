"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("deepmerge");
const fs = require("fs");
const path = require("path");
class Config {
    static get(force) {
        if (this.config && !force) {
            return this.config;
        }
        // Get full path to config folder
        const pathToConfig = path.join(__dirname, '../config');
        // Get default settings values
        const defaultSettings = this.getDefaultSettings(pathToConfig);
        // Get user settings values if present
        const userSettings = this.getUserSettings(pathToConfig);
        // Merge default and user settings
        const settings = merge(defaultSettings, userSettings);
        // Get current version number
        const version = this.getPackageVersion();
        this.config = Object.assign(Object.assign({}, settings), { version });
        return this.config;
    }
    static getDefaultSettings(pathToConfig) {
        const pathToSettings = path.join(pathToConfig, 'settings.default.json');
        return require(pathToSettings);
    }
    static getPackageVersion() {
        const packageJson = require('../package.json');
        return packageJson.version;
    }
    static getUserSettings(pathToConfig) {
        const pathToUserSettings = path.join(pathToConfig, 'settings.json');
        let userSettings = {};
        if (fs.existsSync(pathToUserSettings)) {
            userSettings = require(pathToUserSettings);
        }
        return userSettings;
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map