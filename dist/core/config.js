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
        const pathToConfig = path.join(__dirname, '../../config');
        // Get default settings values
        const pathToSettings = path.join(pathToConfig, 'settings.default.json');
        const defaultSettings = require(pathToSettings);
        // Get user settings values if present
        const pathToUserSettings = path.join(pathToConfig, 'settings.json');
        let userSettings = {};
        if (fs.existsSync(pathToUserSettings)) {
            userSettings = require(pathToUserSettings);
        }
        // Merge default and user settings
        const settings = merge(defaultSettings, userSettings);
        // Get current version number
        const { version } = require('../../package.json');
        this.config = Object.assign({}, settings, { version });
        return this.config;
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map