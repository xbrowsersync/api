import * as bunyan from 'bunyan';
import { Request } from 'express';
import { ApiStatus } from './api';
import BaseService from './baseService';
import BookmarksService from './bookmarksService';

export interface IGetInfoResponse {
  maxSyncSize: number,
  message: string,
  status: number,
  version: string
}

export default class InfoService extends BaseService<BookmarksService> {
  // Returns information describing the xBrowserSync service
  public async getInfo(req: Request): Promise<IGetInfoResponse> {
    // Create response object
    const serviceInfo: IGetInfoResponse = {
      maxSyncSize: this.config.maxSyncSize,
      message: this.config.status.message,
      status: ApiStatus.offline,
      version: this.config.version
    };

    if (this.config.status.online) {
      try {
        // Check if accepting new syncs
        const acceptingNewSyncs = await this.service.isAcceptingNewSyncs();
        serviceInfo.status = acceptingNewSyncs ? ApiStatus.online : ApiStatus.noNewSyncs;
      }
      catch (err) {
        if (this.config.log.enabled) {
          this.logger.error({ req, err }, 'Exception occurred in InfoService.getInfo.');
        }
      }
    }

    return serviceInfo;
  }
}