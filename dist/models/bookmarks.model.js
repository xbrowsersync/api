"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarksModel = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("../uuid");
// Create bookmarks schema to store bookmarks sync data
// Store IDs as binary uuid v4 and disable default id properties
// No concurrent updates so disable version keys
const bookmarksSchema = new mongoose_1.default.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.Buffer,
        get: uuid_1.convertBytesToUuidString,
        set: (idValue) => {
            if (idValue instanceof mongodb_1.Binary) {
                return idValue;
            }
            return uuid_1.convertUuidStringToBinary(idValue);
        },
        default: () => uuid_1.generateRandomUuid(),
    },
    bookmarks: String,
    lastAccessed: {
        default: Date,
        type: Date,
    },
    lastUpdated: {
        default: Date,
        type: Date,
    },
    version: String,
}, {
    _id: false,
    id: false,
    versionKey: false,
});
exports.BookmarksModel = mongoose_1.default.model('Bookmark', bookmarksSchema, 'bookmarks');
