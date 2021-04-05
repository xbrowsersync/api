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
exports.NewSyncLogsModel = void 0;
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid = __importStar(require("uuid"));
// Create new sync logs schema to store ip address and created date
// No concurrent updates so disable version keys
const newSyncLogsSchema = new mongoose_1.default.Schema({
    _id: { type: String, default: uuid.v4 },
    expiresAt: {
        default: () => moment_1.default().add(1, 'days').startOf('day').toDate(),
        type: Date,
    },
    ipAddress: String,
    syncCreated: {
        default: () => new Date(),
        type: Date,
    },
}, {
    versionKey: false,
});
exports.NewSyncLogsModel = mongoose_1.default.model('NewSyncLog', newSyncLogsSchema, 'newsynclogs');
