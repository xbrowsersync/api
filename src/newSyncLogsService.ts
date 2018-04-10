import { Request } from 'express';
import * as moment from 'moment';
import BaseService from './baseService';
import { ClientIpAddressEmptyException, UnspecifiedException } from './exception';
import NewSyncLogsModel, { INewSyncLog, INewSyncLogsModel } from './newSyncLogsModel';
import { LogLevel } from './server';
const Config = require('./config.json');

// Implementation of data service for new sync log operations
export default class NewSyncLogsService extends BaseService<void> {
  // Deletes all new sync logs created before today
  public async clearLog(req: Request): Promise<void> {
    try {
      await NewSyncLogsModel.remove({ syncCreated: { $lt: moment().startOf('day').toDate() } }).exec();
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in NewSyncLogsService.clearLog', req, err);
      throw err;
    }
  }

  // Creates a new sync log entry with the supplied request data
  public async createLog(req: Request): Promise<INewSyncLog> {
    // Get the client's ip address
    const clientIp = this.getClientIpAddress(req);
    if (!clientIp) {
      const err = new ClientIpAddressEmptyException();
      this.log(LogLevel.Error, 'Exception occurred in NewSyncLogsService.createLog', req, err);
      throw err;
    }

    // Create new sync log payload
    const newLog: INewSyncLog = {
      ipAddress: clientIp,
      syncCreated: new Date()
    };
    const newSyncLogsModel = new NewSyncLogsModel(newLog);

    // Commit the payload to the db
    await newSyncLogsModel.save((err, document) => {
      if (err) {
        this.log(LogLevel.Error, 'Exception occurred in NewSyncLogsService.createLog', req, err);
        throw err;
      }
    });

    return newLog;
  }

  // Returns true/false depending on whether a given request's ip address has hit the limit for daily new syncs created
  public async newSyncsLimitHit(req: Request): Promise<boolean> {
    // Clear newsynclogs collection of old entries
    await this.clearLog(req);

    // Get the client's ip address
    const clientIp = this.getClientIpAddress(req);
    if (!clientIp) {
      const err = new ClientIpAddressEmptyException();
      this.log(LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
      throw err;
    }

    let newSyncsCreated = -1;

    // Query the newsynclogs collection for the total number of logs for the given ip address
    try {
      newSyncsCreated = await NewSyncLogsModel.count({ ipAddress: clientIp }).exec();
    }
    catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
      throw err;
    }
    
    // Ensure a valid count was returned
    if (newSyncsCreated < 0) {
      const err = new UnspecifiedException('New syncs created count cannot be less than zero');
      this.log(LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', req, err);
      throw err;
    }

    // Check returned count against config setting
    return newSyncsCreated >= Config.dailyNewSyncsLimit;
  }

  // Extracts and cleans the client's ip address from a given request
  private getClientIpAddress(req: Request): string {
    if (!req.ip) {
      return;
    }

    const matches = req.ip.match(/(\d+\.\d+\.\d+\.\d+)/) || [''];
    return matches[0];
  }
}