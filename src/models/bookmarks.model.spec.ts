import 'jest';
import moment from 'moment';
import * as Uuid from '../uuid';
import { BookmarksModel, IBookmarks } from './bookmarks.model';

describe('BookmarksModel', () => {
  const bookmarksDataTestVal =
    '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';
  const versionTestVal = '1.5.0';
  const lastAccessedTestVal = moment().add(1, 'days').startOf('day').toDate();
  const lastUpdatedTestVal = moment().add(2, 'days').startOf('day').toDate();

  it('bookmarksSchema: should create a default valid UUID', () => {
    const newBookmarks: IBookmarks = {
      bookmarks: bookmarksDataTestVal,
    };
    const bookmarksModel = new BookmarksModel(newBookmarks);
    const binary = Uuid.convertUuidStringToBinary(bookmarksModel._id);
    expect(bookmarksModel.id).not.toBeNull();
    expect(binary.buffer.length).toBe(16);
    expect(binary.sub_type).toBe(4);
  });

  it('bookmarksSchema: should convert string uuid value to binary when setting id', () => {
    const newBookmarks: IBookmarks = {
      bookmarks: bookmarksDataTestVal,
    };
    const bookmarksModel = new BookmarksModel(newBookmarks);
    const convertUuidStringToBinaryMock = jest.spyOn(Uuid, 'convertUuidStringToBinary').mockImplementation();
    bookmarksModel._id = '2b7b65fb-62bc-4162-8ec5-0008183c69b0';
    expect(convertUuidStringToBinaryMock).toBeCalled();
  });

  it('bookmarksSchema: should default lastAccessed value to now', () => {
    const newBookmarks: IBookmarks = {
      bookmarks: bookmarksDataTestVal,
    };
    const bookmarksModel = new BookmarksModel(newBookmarks);
    expect(bookmarksModel.lastAccessed).not.toBeNull();
    expect(bookmarksModel.lastAccessed.getTime()).toBeCloseTo(new Date().getTime(), -4);
  });

  it('bookmarksSchema: should default lastUpdated value to now', () => {
    const newBookmarks: IBookmarks = {
      bookmarks: bookmarksDataTestVal,
    };
    const bookmarksModel = new BookmarksModel(newBookmarks);
    expect(bookmarksModel.lastUpdated).not.toBeNull();
    expect(bookmarksModel.lastUpdated.getTime()).toBeCloseTo(new Date().getTime(), -4);
  });

  it('bookmarksSchema: should set bookmarks to provided value', () => {
    const newBookmarks: IBookmarks = {
      bookmarks: bookmarksDataTestVal,
    };
    const bookmarksModel = new BookmarksModel(newBookmarks);
    expect(bookmarksModel.bookmarks).toStrictEqual(bookmarksDataTestVal);
  });

  it('bookmarksSchema: should set lastAccessed to provided value', () => {
    const newBookmarks: IBookmarks = {
      lastAccessed: lastAccessedTestVal,
    };
    const bookmarksModel = new BookmarksModel(newBookmarks);
    expect(bookmarksModel.lastAccessed).toStrictEqual(lastAccessedTestVal);
  });

  it('bookmarksSchema: should set lastUpdated to provided value', () => {
    const newBookmarks: IBookmarks = {
      lastUpdated: lastUpdatedTestVal,
    };
    const bookmarksModel = new BookmarksModel(newBookmarks);
    expect(bookmarksModel.lastUpdated).toStrictEqual(lastUpdatedTestVal);
  });

  it('bookmarksSchema: should set version to provided value', () => {
    const newBookmarks: IBookmarks = {
      version: versionTestVal,
    };
    const bookmarksModel = new BookmarksModel(newBookmarks);
    expect(bookmarksModel.version).toStrictEqual(versionTestVal);
  });
});
