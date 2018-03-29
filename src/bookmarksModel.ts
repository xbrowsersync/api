import * as mongoose from 'mongoose';
import * as uuid from 'uuid';

export interface IBookmarks {
  _id: any,
  bookmarks: string,
  lastAccessed: Date,
  lastUpdated: Date
}

export interface IBookmarksModel extends IBookmarks, mongoose.Document {
}

export default (() => {
  require('mongoose-uuid2')(mongoose);
  const types: any = mongoose.Types;
  const UUID = types.UUID;
  
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

  return mongoose.model<IBookmarksModel>('Bookmark', bookmarksSchema, 'bookmarks');
})();