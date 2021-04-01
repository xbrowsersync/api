import { Request } from 'express';
import { LogLevel, ServiceStatus } from '../common/enums';
import * as Config from '../config';
import { ApiService } from './api.service';
import { BookmarksService } from './bookmarks.service';

// Interface for get info operation response object
export interface IGetInfoResponse {
  location: string;
  maxSyncSize: number;
  message: string;
  status: number;
  version: string;
}

// Implementation of data service for service info operations
export class InfoService extends ApiService<BookmarksService> {
  // Returns information describing the xBrowserSync service
  async getInfo(req: Request): Promise<IGetInfoResponse> {
    // Convert location code to uppercase if set
    const location = Config.get().location && (Config.get().location as string).toUpperCase();

    // Create response object from config settings
    const serviceInfo: IGetInfoResponse = {
      location,
      maxSyncSize: Config.get().maxSyncSize,
      message: this.stripScriptsFromHtml(Config.get().status.message),
      status: ServiceStatus.offline,
      version: Config.get().version,
    };

    if (Config.get().status.online) {
      try {
        // Call service method to check if accepting new syncs
        const acceptingNewSyncs = await this.service.isAcceptingNewSyncs();
        serviceInfo.status = acceptingNewSyncs ? ServiceStatus.online : ServiceStatus.noNewSyncs;
      } catch (err) {
        this.log(LogLevel.Error, 'Exception occurred in InfoService.getInfo', req, err);
      }
    }

    return serviceInfo;
  }

  // Removes script tags from a given HTML string
  stripScriptsFromHtml(html: string): string {
    return !html ? '' : html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}
