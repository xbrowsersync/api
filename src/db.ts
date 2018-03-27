import * as bunyan from 'bunyan';
import * as mongoose from 'mongoose';
import * as uuid from 'node-uuid';

// Handles database interaction
export default class DB {
  private config = require('./config.json');
  private logger: bunyan;

  constructor(logger: bunyan) {
    this.logger = logger;
  }

  // Connects to the database
  public connect(): Promise<void> {
    const options: mongoose.ConnectionOptions = {
      user: this.config.db.username || process.env.XBROWSERSYNC_DB_USER,
      pass: this.config.db.password || process.env.XBROWSERSYNC_DB_PWD
    };

    return new Promise((resolve, reject) => {
      mongoose.connect(`mongodb://${this.config.db.host}/${this.config.db.name}`, options);
      const db = mongoose.connection;

      db.on('error', (err: mongoose.Error) => {
        if (this.config.log.enabled) {
          this.logger.error({ err: err }, 'Uncaught exception occurred in database.');
        }
        reject(err);
      });

      db.once('open', resolve);
    });
  }
}