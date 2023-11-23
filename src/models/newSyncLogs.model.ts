import moment from 'moment';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface INewSyncLog {
  expiresAt?: Date;
  ipAddress?: string;
  syncCreated?: Date;
}

@Entity()
export class NewSyncLog extends BaseEntity implements INewSyncLog {
  @PrimaryGeneratedColumn()
  _id: string;

  @Column({
    type: Date,
    default: moment().add(1, 'days').startOf('day').format('YYYY-MM-DD hh:mm:ss'),
  })
  expiresAt: Date;

  @Column({
    type: String,
    length: 64,
  })
  ipAddress: string;

  @CreateDateColumn()
  syncCreated: Date;

  static construct<T>(this: new () => T, params: Partial<T>): T {
    return Object.assign(new this(), params);
  }
}
