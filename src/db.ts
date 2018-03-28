import * as bunyan from 'bunyan';
import * as mongoose from 'mongoose';
import * as uuid from 'node-uuid';
const Config = require('./config.json');

// Handles database interaction
export default class DB {
  private logger: bunyan;

  constructor(logger: bunyan) {
    this.logger = logger;
  }

  // Connects to the database
  public connect(): Promise<void> {
    const options: mongoose.ConnectionOptions = {
      connectTimeoutMS: Config.db.connTimeout,
      keepAlive: 1,
      user: Config.db.username || process.env.XBROWSERSYNC_DB_USER,
      pass: Config.db.password || process.env.XBROWSERSYNC_DB_PWD
    };

    return new Promise((resolve, reject) => {
      mongoose.connect(`mongodb://${Config.db.host}/${Config.db.name}`, options);
      const db = mongoose.connection;

      db.on('error', (err: mongoose.Error) => {
        if (Config.log.enabled) {
          this.logger.error({ err: err }, 'Uncaught exception occurred in database.');
        }
        reject(err);
      });

      db.once('open', resolve);
    });
  }
}