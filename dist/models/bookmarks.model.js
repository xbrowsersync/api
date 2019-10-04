"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var uuid = require("uuid");
// Implements a mongoose schema and model to connect data service methods to MongoDB collection
exports.default = (function () {
    require('mongoose-uuid2')(mongoose);
    var types = mongoose.Types;
    var UUID = types.UUID;
    // Create bookmarks schema to store bookmarks sync data
    // Store IDs as binary uuid v4 and disable default id properties
    // No concurrent updates so disable version keys
    var bookmarksSchema = new mongoose.Schema({
        _id: {
            default: uuid.v4,
            type: UUID
        },
        bookmarks: String,
        lastAccessed: {
            default: function () { return new Date(); },
            type: Date
        },
        lastUpdated: {
            default: function () { return new Date(); },
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