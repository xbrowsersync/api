import * as mongoose from 'mongoose';
import * as uuid from 'node-uuid';
require('mongoose-uuid2')(mongoose);

const UUID = mongoose.Types['UUID'];

export interface iBookmarks {
  bookmarks: string,
  lastAccessed: Date,
  lastUpdated: Date
}

export interface iBookmarksModel extends iBookmarks, mongoose.Document {
}

const bookmarksSchema = new mongoose.Schema(
  {
    _id: { type: UUID, default: uuid.v4 },
    bookmarks: String,
    lastAccessed: Date,
    lastUpdated: Date
  },
  {
    _id: false,
    id: false,
    versionKey: false
  }
);

export default mongoose.model<iBookmarksModel>('Bookmark', bookmarksSchema, 'bookmarks');