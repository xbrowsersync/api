"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enums_1 = require("./common/enums");
const Config = __importStar(require("./config"));
// Initialises the database connection using config settings
const connect = async (log) => {
    // Set the db connection options from config settings
    const options = {
        connectTimeoutMS: Config.get().db.connTimeout,
        keepAlive: true,
        ssl: Config.get().db.useSRV || Config.get().db.ssl,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
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
    dbServerUrl += Config.get().db.authSource ? `?authSource=${Config.get().db.authSource}` : '';
    // Connect to the database
    try {
        await mongoose_1.default.connect(dbServerUrl, options);
    }
    catch (err) {
        if ((log !== null && log !== void 0 ? log : undefined) !== undefined) {
            log(enums_1.LogLevel.Error, 'Unable to connect to database', null, err);
        }
        process.exit(1);
    }
};
exports.connect = connect;
// Closes the database connection
const disconnect = async () => {
    await mongoose_1.default.disconnect();
};
exports.disconnect = disconnect;
