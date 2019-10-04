"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var mongoose = require("mongoose");
var uuid = require("uuid");
// Implements a mongoose schema and model to connect data service methods to MongoDB collection
exports.default = (function () {
    // Create new sync logs schema to store ip address and created date
    // No concurrent updates so disable version keys
    var newSyncLogsSchema = new mongoose.Schema({
        _id: { type: String, default: uuid.v4 },
        expiresAt: {
            default: function () { return moment().add(1, 'days').startOf('day').toDate(); },
            type: Date
        },
        ipAddress: String,
        syncCreated: {
            default: function () { return new Date(); },
            type: Date
        }
    }, {
        versionKey: false
    });
    return mongoose.model('NewSyncLog', newSyncLogsSchema, 'newsynclogs');
})();
//# sourceMappingURL=newSyncLogs.model.js.map