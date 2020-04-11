"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Uuid = require("../core/uuid");
const mongoose = require("mongoose");
const mongodb_1 = require("mongodb");
// Implements a mongoose schema and model to connect data service methods to MongoDB collection
exports.default = (() => {
    // Create bookmarks schema to store bookmarks sync data
    // Store IDs as binary uuid v4 and disable default id properties
    // No concurrent updates so disable version keys
    const bookmarksSchema = new mongoose.Schema({
        _id: {
            type: mongoose.Schema.Types.Buffer,
            get: Uuid.convertBytesToUuidString,
            set: (idValue) => {
                if (idValue instanceof mongodb_1.Binary) {
                    return idValue;
                }
                return Uuid.convertUuidStringToBinary(idValue);
            },
            default: () => Uuid.generate()
        },
        bookmarks: String,
        lastAccessed: {
            default: Date,
            type: Date
        },
        lastUpdated: {
            default: Date,
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