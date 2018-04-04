"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const api_1 = require("./api");
// Handles database interaction
class DB {
    constructor(log) {
        this.config = require('./config.json');
        this.log = log;
    }
    // Initialises the database connection using config settings
    connect() {
        // Set the db connection options from config settings
        const options = {
            connectTimeoutMS: this.config.db.connTimeout,
            keepAlive: 1,
            pass: this.config.db.password || process.env.XBROWSERSYNC_DB_PWD,
            user: this.config.db.username || process.env.XBROWSERSYNC_DB_USER
        };
        return new Promise((resolve, reject) => {
            // Connect to the host and db name defined in config settings
            mongoose.connect(`mongodb://${this.config.db.host}/${this.config.db.name}`, options);
            const db = mongoose.connection;
            db.on('error', (err) => {
                this.log(api_1.LogLevel.Error, 'Uncaught exception occurred in database', null, err);
                reject(err);
            });
            db.once('open', resolve);
        });
    }
}
exports.default = DB;
//# sourceMappingURL=db.js.map