import { Request } from 'express';
import * as mongoose from 'mongoose';
import Config from './config';
import { LogLevel } from './server';

// Handles database interaction
export default class DB {
  constructor(private log: (level: LogLevel, message: string, req?: Request, err?: Error) => void) { }

  // Closes the database connection
  public async closeConnection(): Promise<void> {
    await mongoose.disconnect()
  }

  // Initialises the database connection using config settings
  public async openConnection(): Promise<void> {
    // Set the db connection options from config settings
    const options: mongoose.ConnectionOptions = {
      connectTimeoutMS: Config.get().db.connTimeout,
      keepAlive: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    // Get db username and password
    const username = Config.get().db.username || process.env.XBROWSERSYNC_DB_USER;
    const password = Config.get().db.password || process.env.XBROWSERSYNC_DB_PWD;

    // Connect to the host and db name defined in config settings
    let dbServerUrl = 'mongodb';
    if (Config.get().db.useSRV) {
      dbServerUrl += `+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${Config.get().db.host}/${Config.get().db.name}`;
      dbServerUrl += (Config.get().db.authSource) ? `?authSource=${Config.get().db.authSource}` : '';
    }
    else {
      dbServerUrl += `://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${Config.get().db.host}:${Config.get().db.port}/${Config.get().db.name}?authSource=${Config.get().db.authSource}`;
    }
    mongoose.connect(dbServerUrl, options);
    const dbConn = mongoose.connection;

    await new Promise((resolve, reject) => {
      dbConn.on('close', () => {
        dbConn.removeAllListeners();
      });

      dbConn.on('error', (err: mongoose.Error) => {
        this.log(LogLevel.Error, 'Database error', null, err);
        reject(new Error('Unable to connect to database.'));
      });

      dbConn.once('open', resolve);
    });
  }
}