import * as mongoose from 'mongoose';
import * as uuid from 'uuid';

export interface INewSyncLog {
  ipAddress: string,
  syncCreated?: Date
}

export interface INewSyncLogsModel extends INewSyncLog, mongoose.Document {
}

// Implements a mongoose schema and model to connect data service methods to MongoDB collection
export default (() => {
  // Create new sync logs schema to store ip address and created date
  // No concurrent updates so disable version keys
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