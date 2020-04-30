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
// Initialises the database connection using config settings
exports.connect = (log) => __awaiter(void 0, void 0, void 0, function* () {
    // Set the db connection options from config settings
    const options = {
        connectTimeoutMS: Config.get().db.connTimeout,
        keepAlive: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
    // Configure db credentials
    const username = Config.get().db.username || process.env.XBROWSERSYNC_DB_USER;
    const password = Config.get().db.password || process.env.XBROWSERSYNC_DB_PWD;
    const creds = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
    // Create mongo connection uri using host and db name defined in config settings
    let dbServerUrl = 'mongodb';
    if (Config.get().db.useSRV) {
        dbServerUrl += `+srv://${creds}${Config.get().db.host}/${Config.get().db.name}`;
    }
    else {
        dbServerUrl += `://${creds}${Config.get().db.host}:${Config.get().db.port}/${Config.get().db.name}`;
    }
    dbServerUrl += (Config.get().db.authSource) ? `?authSource=${Config.get().db.authSource}` : '';
    // Connect to the database
    try {
        yield mongoose.connect(dbServerUrl, options);
    }
    catch (err) {
        log && log(server_1.LogLevel.Error, 'Unable to connect to database', null, err);
        process.exit(1);
    }
});
// Closes the database connection
exports.disconnect = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose.disconnect();
});
//# sourceMappingURL=db.js.map