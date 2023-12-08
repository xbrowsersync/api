import moment from 'moment';
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export interface IBookmarks {
  id?: string;
  bookmarks?: string;
  lastAccessed?: Date;
  lastUpdated?: Date;
  version?: string;
}

@Entity()
export class Bookmarks extends BaseEntity implements IBookmarks {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    default: '',
  })
  bookmarks: string;

  @Column({
    type: Date,
    default: moment().format('YYYY-MM-DD hh:mm:ss'),
  })
  lastAccessed: Date;

  @Column({
    type: Date,
    default: moment().format('YYYY-MM-DD hh:mm:ss'),
  })
  lastUpdated: Date;

  @Column({
    type: String,
    length: 6,
  })
  version: string;

  @BeforeInsert()
  generateUuid() {
    this.id = uuidv4().replace(/-/g, '');
  }

  static construct<T>(this: new () => T, params: Partial<T>): T {
    return Object.assign(new this(), params);
  }
}
