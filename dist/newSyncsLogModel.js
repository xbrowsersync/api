"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const newSyncsLogSchema = new mongoose.Schema({
    ipAddress: String,
    syncCreated: Date
}, { id: false });
exports.default = mongoose.model('newSyncsLog', newSyncsLogSchema);
//# sourceMappingURL=newSyncsLogModel.js.map