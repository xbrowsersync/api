"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Config = require("./config");
const server_1 = require("./server");
// Handles database interaction
class DB {
    constructor(log) {
        this.log = log;
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
                connectTimeoutMS: Config.getConfig().db.connTimeout,
                keepAlive: true,
                useFindAndModify: false,
                useNewUrlParser: true,
                useUnifiedTopology: true
            };
            // Get db username and password
            const username = Config.getConfig().db.username || process.env.XBROWSERSYNC_DB_USER;
            const password = Config.getConfig().db.password || process.env.XBROWSERSYNC_DB_PWD;
            // Connect to the host and db name defined in config settings
            let dbServerUrl = 'mongodb';
            if (Config.getConfig().db.useSRV) {
                dbServerUrl += `+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${Config.getConfig().db.host}/${Config.getConfig().db.name}`;
                dbServerUrl += (Config.getConfig().db.authSource) ? `?authSource=${Config.getConfig().db.authSource}` : '';
            }
            else {
                dbServerUrl += `://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${Config.getConfig().db.host}:${Config.getConfig().db.port}/${Config.getConfig().db.name}?authSource=${Config.getConfig().db.authSource}`;
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