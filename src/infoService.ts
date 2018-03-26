import { Request } from 'express';
import * as bunyan from 'bunyan';
import * as constants from './constants';
import BookmarksService from './bookmarksService';

export interface iGetInfoResponse {
  maxSyncSize: number,
  message: string,
  status: number,
  version: string
}

export default class InfoService {
  private bookmarksService: BookmarksService;
  private config = require('./config.json');
  private logger: bunyan;

  constructor(bookmarksService: BookmarksService, logger: bunyan) {
    this.bookmarksService = bookmarksService;
    this.logger = logger;
  }

  // Returns information describing the xBrowserSync service
  public async getInfo(req: Request): Promise<iGetInfoResponse> {
    // Create response object
    const serviceInfo: iGetInfoResponse = {
      maxSyncSize: this.config.maxSyncSize,
      message: this.config.status.message,
      status: constants.serviceStatuses.offline,
      version: this.config.version
    };

    if (!this.config.status.offline) {
      try {
        // Check if accepting new syncs
        const acceptingNewSyncs = await this.bookmarksService.isAcceptingNewSyncs();
        serviceInfo.status = acceptingNewSyncs ? constants.serviceStatuses.online : constants.serviceStatuses.noNewSyncs;
      }
      catch (err) {
        this.logger.error({ req: req, err: err }, 'Exception occurred in InfoService.getInfo.');
      }
    }

    return serviceInfo;
  }
}