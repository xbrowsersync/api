"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("deepmerge");
const fs = require("fs");
const path = require("path");
class Config {
    static get() {
        if (this.config) {
            return this.config;
        }
        // Get default settings values
        const defaultSettings = require('../config/settings.default.json');
        // Get user settings values if present
        let userSettings = {};
        if (fs.existsSync(path.join(__dirname, '../config', 'settings.json'))) {
            userSettings = require('../config/settings.json');
        }
        // Merge default and user settings
        const settings = merge(defaultSettings, userSettings);
        // Get current version number
        const version = require('../config/version.json');
        this.config = Object.assign({}, settings, version);
        return this.config;
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map