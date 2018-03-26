import * as mongoose from 'mongoose';

export interface iNewSyncsLog {
  ipAddress: String,
  syncCreated: Date
}

export interface iNewSyncsLogModel extends iNewSyncsLog, mongoose.Document {
}

const newSyncsLogSchema = new mongoose.Schema({
  ipAddress: String,
  syncCreated: Date
}, { id: false });

export default mongoose.model<iNewSyncsLogModel>('newSyncsLog', newSyncsLogSchema);