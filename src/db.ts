import { Request } from 'express';
import mongoose from 'mongoose';
import { LogLevel } from './common/enums';
import * as Config from './config';

// Initialises the database connection using config settings
export const connect = async (
  log?: (level: LogLevel, message: string, req?: Request, err?: Error) => void
): Promise<void> => {
  // Set the db connection options from config settings
  const options: mongoose.ConnectionOptions = {
    connectTimeoutMS: Config.get().db.connTimeout,
    keepAlive: true,
    ssl: Config.get().db.useSRV || Config.get().db.ssl,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Configure db credentials
  const username = Config.get().db.username || process.env.XBROWSERSYNC_DB_USER;
  const password = Config.get().db.password || process.env.XBROWSERSYNC_DB_PWD;
  const creds = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';

  // Create mongo connection uri using host and db name defined in config settings
  let dbServerUrl = 'mongodb';
  if (Config.get().db.useSRV) {
    dbServerUrl += `+srv://${creds}${Config.get().db.host}/${Config.get().db.name}`;
  } else {
    dbServerUrl += `://${creds}${Config.get().db.host}:${Config.get().db.port}/${Config.get().db.name}`;
  }
  dbServerUrl += Config.get().db.authSource ? `?authSource=${Config.get().db.authSource}` : '';

  // Connect to the database
  try {
    await mongoose.connect(dbServerUrl, options);
  } catch (err) {
    if ((log ?? undefined) !== undefined) {
      log(LogLevel.Error, 'Unable to connect to database', null, err);
    }
    process.exit(1);
  }
};

// Closes the database connection
export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect();
};
