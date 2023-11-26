import { DataSource } from 'typeorm';
import * as Config from './config';
import { Initialize1700911500755 } from './migrations/1700911500755-Initialize';
import { Bookmarks } from './models/bookmarks.model';
import { NewSyncLog } from './models/newSyncLogs.model';

const dbType = Config.get().db.type;

export const AppDataSource = new DataSource({
  type: dbType,
  host: Config.get().db.host,
  port: Config.get().db.port || undefined,
  username: Config.get().db.username,
  password: Config.get().db.password,
  database: dbType == 'sqlite' ? Config.get().db.filepath : Config.get().db.name,
  synchronize: false,
  logging: false,
  entities: [Bookmarks, NewSyncLog],
  subscribers: [],

  migrationsRun: true,
  migrationsTableName: 'migration',
  migrations: [
    Initialize1700911500755,
    // Add further migrations here
  ],
});
