import { Request } from 'express';
import { LogLevel } from '../common/enums';
import * as Config from '../config';
import { UnspecifiedException } from '../exception';
import { INewSyncLog, NewSyncLogsModel } from '../models/newSyncLogs.model';
import { ApiService } from './api.service';

// Implementation of data service for new sync log operations
export class NewSyncLogsService extends ApiService<void> {
  // Creates a new sync log entry with the supplied request data
  async createLog(req: Request): Promise<INewSyncLog> {
    // Get the client's ip address
    const clientIp = this.getClientIpAddress(req);
    if (!clientIp) {
      this.log(LogLevel.Info, 'Unable to determine client IP address');
      return null;
    }

    // Create new sync log payload
    const newLogPayload: INewSyncLog = {
      ipAddress: clientIp,
    };
    const newSyncLogsModel = new NewSyncLogsModel(newLogPayload);

    // Commit the payload to the db
    try {
      await newSyncLogsModel.save();
    } catch (err) {
      this.log(LogLevel.Error, 'Exception occurred in NewSyncLogsService.createLog', req, err);
      throw err;
    }

    return newLogPayload;
  }

  // Returns true/false depending on whether a given request's ip address has hit the limit for daily new syncs created
  async newSyncsLimitHit(req: Request): Promise<boolean> {
    // Get the client's ip address
    const clientIp = this.getClientIpAddress(req);
    if (!clientIp) {
      this.log(LogLevel.Info, 'Unable to determine client IP address');
      return null;
    }

    let newSyncsCreated = -1;

    // Query the newsynclogs collection for the total number of logs for the given ip address
    try {
      newSyncsCreated = await NewSyncLogsModel.countDocuments({ ipAddress: clientIp }).exec();
    } catch (err) {
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
    return newSyncsCreated >= Config.get().dailyNewSyncsLimit;
  }

  // Extracts the client's ip address from a given request
  getClientIpAddress(req: Request): string {
    if (!req || !req.ip) {
      return null;
    }

    return req.ip;
  }
}
