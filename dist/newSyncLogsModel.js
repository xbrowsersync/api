"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const uuid = require("node-uuid");
const newSyncLogsSchema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    ipAddress: String,
    syncCreated: Date
}, {
    versionKey: false
});
exports.default = mongoose.model('NewSyncLog', newSyncLogsSchema, 'newsynclogs');
//# sourceMappingURL=newSyncLogsModel.js.map