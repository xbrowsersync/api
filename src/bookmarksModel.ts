import * as mongoose from 'mongoose';
import * as uuid from 'node-uuid';
import { Binary } from 'bson';
require('mongoose-uuid2')(mongoose);

const UUID = mongoose.Types['UUID'];

export interface iBookmarks {
  bookmarks: String,
  lastAccessed: Date,
  lastUpdated: Date
}

export interface iBookmarksModel extends iBookmarks, mongoose.Document {
}

const bookmarksSchema = new mongoose.Schema({
  _id: { type: UUID, default: uuid.v4 },
  bookmarks: String,
  lastAccessed: Date,
  lastUpdated: Date
}, { id: false });

export default mongoose.model<iBookmarksModel>('bookmarks', bookmarksSchema);