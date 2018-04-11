import { Request } from 'express';
import * as mongoose from 'mongoose';
import * as uuid from 'uuid';
import { LogLevel } from './server';
const Config = require('./config.json');

// Handles database interaction
export default class DB {
  private log: (level: LogLevel, message: string, req?: Request, err?: Error) => void;

  constructor(log: (level: LogLevel, message: string, req?: Request, err?: Error) => void) {
    this.log = log;
  }

  // Initialises the database connection using config settings
  public async connect(): Promise<void> {
    // Set the db connection options from config settings
    const options: mongoose.ConnectionOptions = {
      connectTimeoutMS: Config.db.connTimeout,
      keepAlive: 1,
      pass: Config.db.password || process.env.XBROWSERSYNC_DB_PWD,
      user: Config.db.username || process.env.XBROWSERSYNC_DB_USER
    };

    // Connect to the host and db name defined in config settings
    const dbServerUrl = `mongodb://${Config.db.host}/${Config.db.name}`;
    mongoose.connect(dbServerUrl, options);
    const db = mongoose.connection;

    await new Promise((resolve, reject) => {
      db.on('error', (err: mongoose.Error) => {
        this.log(LogLevel.Error, 'Uncaught exception occurred in database', null, err);
        reject(err);
      });

      db.once('open', resolve);
    });
  }
}