"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var merge = require("deepmerge");
var fs = require("fs");
var path = require("path");
var Config = /** @class */ (function () {
    function Config() {
    }
    Config.get = function (force) {
        if (this.config && !force) {
            return this.config;
        }
        // Get full path to config folder
        var pathToConfig = path.join(__dirname, '../../config');
        // Get default settings values
        var pathToSettings = path.join(pathToConfig, 'settings.default.json');
        var defaultSettings = require(pathToSettings);
        // Get user settings values if present
        var pathToUserSettings = path.join(pathToConfig, 'settings.json');
        var userSettings = {};
        if (fs.existsSync(pathToUserSettings)) {
            userSettings = require(pathToUserSettings);
        }
        // Merge default and user settings
        var settings = merge(defaultSettings, userSettings);
        // Get current version number
        var version = require('../../package.json').version;
        this.config = __assign(__assign({}, settings), { version: version });
        return this.config;
    };
    return Config;
}());
exports.default = Config;
//# sourceMappingURL=config.js.map