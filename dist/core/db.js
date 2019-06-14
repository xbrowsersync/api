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
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const config_1 = require("./config");
const exception_1 = require("./exception");
const server_1 = require("./server");
// Handles database interaction
class DB {
    constructor(log) {
        this.log = log;
    }
    static idIsValid(id) {
        let binary;
        let base64Str;
        if (!id) {
            throw new exception_1.InvalidSyncIdException();
        }
        try {
            binary = new mongodb.Binary(Buffer.from(id, 'hex'), 4);
            base64Str = binary.buffer.toString('base64');
        }
        catch (err) {
            throw new exception_1.InvalidSyncIdException();
        }
        if (!binary || !base64Str) {
            throw new exception_1.InvalidSyncIdException();
        }
    }
    // Closes the database connection
    closeConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mongoose.disconnect();
        });
    }
    // Initialises the database connection using config settings
    openConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            // Set the db connection options from config settings
            const options = {
                connectTimeoutMS: config_1.default.get().db.connTimeout,
                keepAlive: true,
                useFindAndModify: false,
                useNewUrlParser: true
            };
            // Get db username and password
            const username = config_1.default.get().db.username || process.env.XBROWSERSYNC_DB_USER;
            const password = config_1.default.get().db.password || process.env.XBROWSERSYNC_DB_PWD;
            // Connect to the host and db name defined in config settings
            let dbServerUrl = 'mongodb';
            if (config_1.default.get().db.useSRV) {
                dbServerUrl += `+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${config_1.default.get().db.host}/${config_1.default.get().db.name}`;
                dbServerUrl += (config_1.default.get().db.authSource) ? `?authSource=${config_1.default.get().db.authSource}` : '';
            }
            else {
                dbServerUrl += `://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${config_1.default.get().db.host}:${config_1.default.get().db.port}/${config_1.default.get().db.name}?authSource=${config_1.default.get().db.authSource}`;
            }
            mongoose.connect(dbServerUrl, options);
            const dbConn = mongoose.connection;
            yield new Promise((resolve, reject) => {
                dbConn.on('close', () => {
                    dbConn.removeAllListeners();
                });
                dbConn.on('error', (err) => {
                    this.log(server_1.LogLevel.Error, 'Database error', null, err);
                    reject(new Error('Unable to connect to database.'));
                });
                dbConn.once('open', resolve);
            });
        });
    }
}
exports.default = DB;
//# sourceMappingURL=db.js.map