import { DataSource } from 'typeorm';
import * as Config from './config';
import { Bookmarks } from './models/bookmarks.model';
import { NewSyncLog } from './models/newSyncLogs.model';

console.log('Init DB');

export const AppDataSource = new DataSource({
  type: Config.get().db.type,
  host: Config.get().db.host,
  port: Config.get().db.port || undefined,
  username: Config.get().db.username,
  password: Config.get().db.password,
  database: Config.get().db.name,
  synchronize: true,
  logging: false,
  entities: [Bookmarks, NewSyncLog],
  subscribers: [],
  migrations: [],
});
