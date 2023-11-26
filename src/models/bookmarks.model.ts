import moment from 'moment';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface IBookmarks {
  id?: string;
  bookmarks?: string;
  lastAccessed?: Date;
  lastUpdated?: Date;
  version?: string;
}

@Entity()
export class Bookmarks extends BaseEntity implements IBookmarks {
  @PrimaryGeneratedColumn('uuid')
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

  @UpdateDateColumn()
  lastUpdated: Date;

  @Column({
    type: String,
    length: 6,
  })
  version: string;

  static construct<T>(this: new () => T, params: Partial<T>): T {
    return Object.assign(new this(), params);
  }
}
