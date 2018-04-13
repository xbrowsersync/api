"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const mongoose = require("mongoose");
const uuid = require("uuid");
// Implements a mongoose schema and model to connect data service methods to MongoDB collection
exports.default = (() => {
    // Create new sync logs schema to store ip address and created date
    // No concurrent updates so disable version keys
    const newSyncLogsSchema = new mongoose.Schema({
        _id: { type: String, default: uuid.v4 },
        expiresAt: {
            default: () => moment().add(1, 'days').startOf('day').toDate(),
            type: Date
        },
        ipAddress: String,
        syncCreated: {
            default: () => new Date(),
            type: Date
        }
    }, {
        versionKey: false
    });
    return mongoose.model('NewSyncLog', newSyncLogsSchema, 'newsynclogs');
})();
//# sourceMappingURL=newSyncLogsModel.js.map