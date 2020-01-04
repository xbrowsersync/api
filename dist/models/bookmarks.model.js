"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const uuid = require("uuid");
// Implements a mongoose schema and model to connect data service methods to MongoDB collection
exports.default = (() => {
    const types = mongoose.Types;
    // Create bookmarks schema to store bookmarks sync data
    // Store IDs as binary uuid v4 and disable default id properties
    // No concurrent updates so disable version keys
    const bookmarksSchema = new mongoose.Schema({
        _id: {
            default: uuid.v4,
            type: String
        },
        bookmarks: String,
        lastAccessed: {
            default: () => new Date(),
            type: Date
        },
        lastUpdated: {
            default: () => new Date(),
            type: Date
        },
        version: String
    }, {
        _id: false,
        id: false,
        versionKey: false
    });
    return mongoose.model('Bookmark', bookmarksSchema, 'bookmarks');
})();
//# sourceMappingURL=bookmarks.model.js.map