import * as mongoose from 'mongoose';
import * as uuid from 'uuid';

export interface INewSyncLog {
  ipAddress: string,
  syncCreated: Date
}

export interface INewSyncLogsModel extends INewSyncLog, mongoose.Document {
}

export default (() => {
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

  return mongoose.model<INewSyncLogsModel>('NewSyncLog', newSyncLogsSchema, 'newsynclogs');
})();