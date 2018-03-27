import * as mongoose from 'mongoose';
import * as uuid from 'node-uuid';

export interface iNewSyncLog {
  ipAddress: String,
  syncCreated: Date
}

export interface iNewSyncLogsModel extends iNewSyncLog, mongoose.Document {
}

const newSyncLogsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuid.v4 },
    ipAddress: String,
    syncCreated: Date
  },
  {
    versionKey: false
  }
);

export default mongoose.model<iNewSyncLogsModel>('NewSyncLog', newSyncLogsSchema, 'newsynclogs');