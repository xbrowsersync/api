"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Config = require('./config.json');
// Handles database interaction
class DB {
    constructor(logger) {
        this.logger = logger;
    }
    // Connects to the database
    connect() {
        const options = {
            connectTimeoutMS: Config.db.connTimeout,
            keepAlive: 1,
            user: Config.db.username || process.env.XBROWSERSYNC_DB_USER,
            pass: Config.db.password || process.env.XBROWSERSYNC_DB_PWD
        };
        return new Promise((resolve, reject) => {
            mongoose.connect(`mongodb://${Config.db.host}/${Config.db.name}`, options);
            const db = mongoose.connection;
            db.on('error', (err) => {
                if (Config.log.enabled) {
                    this.logger.error({ err: err }, 'Uncaught exception occurred in database.');
                }
                reject(err);
            });
            db.once('open', resolve);
        });
    }
}
exports.default = DB;
//# sourceMappingURL=db.js.map