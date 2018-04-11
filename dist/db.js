"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const server_1 = require("./server");
const Config = require('./config.json');
// Handles database interaction
class DB {
    constructor(log) {
        this.log = log;
    }
    // Initialises the database connection using config settings
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            // Set the db connection options from config settings
            const options = {
                connectTimeoutMS: Config.db.connTimeout,
                keepAlive: 1,
                pass: Config.db.password || process.env.XBROWSERSYNC_DB_PWD,
                user: Config.db.username || process.env.XBROWSERSYNC_DB_USER
            };
            // Connect to the host and db name defined in config settings
            const dbServerUrl = `mongodb://${Config.db.host}/${Config.db.name}`;
            mongoose.connect(dbServerUrl, options);
            const db = mongoose.connection;
            yield new Promise((resolve, reject) => {
                db.on('error', (err) => {
                    this.log(server_1.LogLevel.Error, 'Uncaught exception occurred in database', null, err);
                    reject(err);
                });
                db.once('open', resolve);
            });
        });
    }
}
exports.default = DB;
//# sourceMappingURL=db.js.map