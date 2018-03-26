"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const uuid = require("node-uuid");
require('mongoose-uuid2')(mongoose);
const UUID = mongoose.Types['UUID'];
const bookmarksSchema = new mongoose.Schema({
    _id: { type: UUID, default: uuid.v4 },
    bookmarks: String,
    lastAccessed: Date,
    lastUpdated: Date
}, { id: false });
exports.default = mongoose.model('bookmarks', bookmarksSchema);
//# sourceMappingURL=bookmarksModel.js.map