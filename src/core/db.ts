import { Request } from 'express';
import * as mongojs from 'mongojs';
import * as mongoose from 'mongoose';

import Config from './config';
import { InvalidSyncIdException } from './exception';
import { LogLevel } from './server';

// Handles database interaction
export default class DB {
  public static idIsValid(id): void {
    let binary;

    if (!id) {
      throw new InvalidSyncIdException();
    }

    try {
      binary = mongojs.Binary(new Buffer(id, 'hex'), mongojs.Binary.SUBTYPE_UUID);
    }
    catch (err) {
      throw new InvalidSyncIdException();
    }

    if (!binary || !binary.toJSON()) {
      throw new InvalidSyncIdException();
    }
  }

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
      keepAlive: 1,
      pass: Config.get().db.password || process.env.XBROWSERSYNC_DB_PWD,
      user: Config.get().db.username || process.env.XBROWSERSYNC_DB_USER
    };

    // Connect to the host and db name defined in config settings
    const dbServerUrl = `mongodb://${Config.get().db.host}/${Config.get().db.name}`;
    mongoose.connect(dbServerUrl, options);
    const dbConn = mongoose.connection;

    await new Promise((resolve, reject) => {
      dbConn.on('close', () => {
        dbConn.removeAllListeners();
      });

      dbConn.on('error', (err: mongoose.Error) => {
        this.log(LogLevel.Error, 'Uncaught exception occurred in database', null, err);
        reject(err);
      });

      dbConn.once('open', resolve);
    });
  }
}