"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    static get() {
        const settings = require('../config/settings.json');
        const version = require('../config/version.json');
        return Object.assign({}, settings, version);
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map