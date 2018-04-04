"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const uuid = require("uuid");
// Implements a mongoose schema and model to connect data service methods to MongoDB collection
exports.default = (() => {
    require('mongoose-uuid2')(mongoose);
    const types = mongoose.Types;
    const UUID = types.UUID;
    // Create bookmarks schema to store bookmarks sync data
    // Store IDs as binary uuid v4 and disable default id properties
    // No concurrent updates so disable version keys
    const bookmarksSchema = new mongoose.Schema({
        _id: { type: UUID, default: uuid.v4 },
        bookmarks: String,
        lastAccessed: Date,
        lastUpdated: Date
    }, {
        _id: false,
        id: false,
        versionKey: false
    });
    return mongoose.model('Bookmark', bookmarksSchema, 'bookmarks');
})();
//# sourceMappingURL=bookmarksModel.js.map