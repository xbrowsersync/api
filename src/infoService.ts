import { Request } from 'express';
import { ApiStatus, LogLevel } from './api';
import BaseService from './baseService';
import BookmarksService from './bookmarksService';

// Interface for get info operation response object
export interface IGetInfoResponse {
  maxSyncSize: number,
  message: string,
  status: number,
  version: string
}

// Implementation of data service for service info operations
export default class InfoService extends BaseService<BookmarksService> {
  // Returns information describing the xBrowserSync service
  public async getInfo(req: Request): Promise<IGetInfoResponse> {
    // Create response object from config settings
    const serviceInfo: IGetInfoResponse = {
      maxSyncSize: this.config.maxSyncSize,
      message: this.config.status.message,
      status: ApiStatus.offline,
      version: this.config.version
    };

    if (this.config.status.online) {
      try {
        // Call service method to check if accepting new syncs
        const acceptingNewSyncs = await this.service.isAcceptingNewSyncs();
        serviceInfo.status = acceptingNewSyncs ? ApiStatus.online : ApiStatus.noNewSyncs;
      }
      catch (err) {
        this.log(LogLevel.Error, 'Exception occurred in InfoService.getInfo', req, err);
      }
    }

    return serviceInfo;
  }
}