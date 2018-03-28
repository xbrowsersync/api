import { Request } from 'express';
import * as bunyan from 'bunyan';
import { ApiStatus } from './api';
import BookmarksService from './bookmarksService';
const Config = require('./config.json');

export interface iGetInfoResponse {
  maxSyncSize: number,
  message: string,
  status: number,
  version: string
}

export default class InfoService {
  private bookmarksService: BookmarksService;
  private logger: bunyan;

  constructor(bookmarksService: BookmarksService, logger: bunyan) {
    this.bookmarksService = bookmarksService;
    this.logger = logger;
  }

  // Returns information describing the xBrowserSync service
  public async getInfo(req: Request): Promise<iGetInfoResponse> {
    // Create response object
    const serviceInfo: iGetInfoResponse = {
      maxSyncSize: Config.maxSyncSize,
      message: Config.status.message,
      status: ApiStatus.offline,
      version: Config.version
    };

    if (Config.status.online) {
      try {
        // Check if accepting new syncs
        const acceptingNewSyncs = await this.bookmarksService.isAcceptingNewSyncs();
        serviceInfo.status = acceptingNewSyncs ? ApiStatus.online : ApiStatus.noNewSyncs;
      }
      catch (err) {
        if (Config.log.enabled) {
          this.logger.error({ req: req, err: err }, 'Exception occurred in InfoService.getInfo.');
        }
      }
    }

    return serviceInfo;
  }
}