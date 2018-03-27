import { Request } from 'express';
import * as bunyan from 'bunyan';
import * as moment from 'moment';
import NewSyncLogsModel, { iNewSyncLog, iNewSyncLogsModel } from './newSyncLogsModel';

// Handles data interaction for the newsynclogs collection in mongodb
export default class NewSyncLogsService {
  private config = require('./config.json');
  private logger: bunyan;

  constructor(logger: bunyan) {
    this.logger = logger;
  }

  // Clears all new sync logs older than today
  private async clearLog(req: Request): Promise<void> {
    const result = await new Promise((resolve, reject) => {
      NewSyncLogsModel.remove({
        syncCreated: {
          $lt: moment().startOf('day').toDate()
        }
      },
        err => {
          if (err) {
            if (this.config.log.enabled) {
              this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.clearLog.');
            }
            reject(err);
          }
        });

      resolve();
    });
  }

  // Adds a new log entry to the newsynclogs collection based on a given request
  public async createLog(req: Request): Promise<iNewSyncLogsModel> {
    // Get the client's ip address
    const clientIp = this.getClientIpAddress(req);
    if (!clientIp) {
      if (this.config.log.enabled) {
        const err = new Error('Client IP address is null');
        this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.createLog.');
      }
      return;
    }

    // Initialise the document
    const createLog = new NewSyncLogsModel({
      ipAddress: clientIp,
      syncCreated: new Date()
    } as iNewSyncLog);

    // Add document to db
    const newLog = await new Promise<iNewSyncLogsModel>((resolve, reject) => {
      createLog.save((err, document) => {
        if (err) {
          if (this.config.log.enabled) {
            this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.createLog.');
          }
          reject(err);
        }

        resolve(document);
      });
    });

    return newLog;
  }

  // Extracts and cleans the client's IP address from a given request
  private getClientIpAddress(req: Request): string {
    const matches = req.ip.match(/(\d+\.\d+\.\d+\.\d+)/) || [''];
    return matches[0];
  }

  // 
  public async newSyncsLimitHit(req: Request): Promise<boolean> {
    // Clear new syncs log of old entries
    await this.clearLog(req);

    // Get the client's ip address
    const clientIp = this.getClientIpAddress(req);
    if (!clientIp) {
      const err = new Error('Client IP address is null');
      if (this.config.log.enabled) {
        this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit.');
      }
      throw err;
    }

    // Get number of new syncs created today by this ip
    const newSyncsCreated = await new Promise((resolve, reject) => {
      NewSyncLogsModel.count({
        ipAddress: clientIp
      },
        (err, count) => {
          if (err) {
            if (this.config.log.enabled) {
              this.logger.error({ req: req, err: err }, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit.');
            }
            reject(err);
          }

          resolve(count);
        });
    });

    // Check returned count against dailyNewSyncsLimit config value
    return newSyncsCreated >= this.config.dailyNewSyncsLimit;
  }
}