import { Request } from 'express';
import BaseService from './baseService';
import BookmarksService from './bookmarksService';
import Config from './config';
import { ApiStatus, LogLevel } from './server';

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
      maxSyncSize: Config.get().maxSyncSize,
      message: this.stripScriptsFromHtml(Config.get().status.message),
      status: ApiStatus.offline,
      version: Config.get().version
    };

    if (Config.get().status.online) {
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

  // Removes script tags from a given HTML string
  private stripScriptsFromHtml(html: string): string {
    return !html ? '' : html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}