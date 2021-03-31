import 'jest';
import { Request } from 'express';
import { LogLevel, ServiceStatus } from '../common/enums';
import * as Config from '../config';
import { BookmarksService } from './bookmarks.service';
import { InfoService } from './info.service';

jest.mock('./bookmarks.service');

describe('InfoService', () => {
  let logMock: jest.Mock<any, any>;

  beforeEach(() => {
    logMock = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getInfo: should return location config value', async () => {
    const locationTest = 'gb';
    const configSettingsTest: Config.IConfigSettings = {
      location: locationTest,
      status: {
        online: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockResolvedValue(true);
    const bookmarksService = new BookmarksService(null, jest.fn());
    const infoService = new InfoService(bookmarksService, jest.fn());
    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);
    expect(response.location).toStrictEqual(locationTest.toUpperCase());
  });

  it('getInfo: should return max sync size config value', async () => {
    const maxSyncSizeTest = 1;
    const configSettingsTest: Config.IConfigSettings = {
      maxSyncSize: maxSyncSizeTest,
      status: {
        online: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockResolvedValue(true);
    const bookmarksService = new BookmarksService(null, jest.fn());
    const infoService = new InfoService(bookmarksService, jest.fn());
    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);
    expect(response.maxSyncSize).toStrictEqual(maxSyncSizeTest);
  });

  it('getInfo: should return message config value', async () => {
    const messageTest = 'Test API message';
    const configSettingsTest: Config.IConfigSettings = {
      status: {
        message: messageTest,
        online: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockResolvedValue(true);
    const bookmarksService = new BookmarksService(null, jest.fn());
    const infoService = new InfoService(bookmarksService, jest.fn());
    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);
    expect(response.message).toStrictEqual(messageTest);
  });

  it('getInfo: should strip script tags from message config value', async () => {
    const messageTest = `<script>alert('test');</script>`;
    const configSettingsTest: Config.IConfigSettings = {
      status: {
        message: messageTest,
        online: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockResolvedValue(true);
    const bookmarksService = new BookmarksService(null, jest.fn());
    const infoService = new InfoService(bookmarksService, jest.fn());
    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);
    expect(response.message).toStrictEqual('');
  });

  it('getInfo: should return correct API status when online', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      status: {
        online: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockResolvedValue(true);
    const bookmarksService = new BookmarksService(null, jest.fn());
    const infoService = new InfoService(bookmarksService, jest.fn());
    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);
    expect(response.status).toStrictEqual(ServiceStatus.online);
  });

  it('getInfo: should return correct API status when offline', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      status: {
        online: false,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockResolvedValue(true);
    const bookmarksService = new BookmarksService(null, jest.fn());
    const infoService = new InfoService(bookmarksService, jest.fn());
    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);
    expect(response.status).toStrictEqual(ServiceStatus.offline);
  });

  it('getInfo: should return version config value', async () => {
    const versionTest = '0.0.0';
    const configSettingsTest: Config.IConfigSettings = {
      status: {
        online: false,
      },
      version: versionTest,
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockResolvedValue(true);
    const bookmarksService = new BookmarksService(null, jest.fn());
    const infoService = new InfoService(bookmarksService, jest.fn());
    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);
    expect(response.version).toStrictEqual(versionTest);
  });

  it('getInfo: should return correct API status when not accepting new syncs', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      status: {
        online: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockResolvedValue(false);
    const bookmarksService = new BookmarksService(null, jest.fn());
    const infoService = new InfoService(bookmarksService, jest.fn());
    const req: Partial<Request> = {};
    const response = await infoService.getInfo(req as Request);
    expect(response.status).toStrictEqual(ServiceStatus.noNewSyncs);
  });

  it('getInfo: should catch and log errors', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      status: {
        online: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const errorTest = new Error();
    jest.spyOn(BookmarksService.prototype, 'isAcceptingNewSyncs').mockImplementation(() => {
      throw errorTest;
    });
    const bookmarksService = new BookmarksService(null, logMock);
    const infoService = new InfoService(bookmarksService, logMock);
    const req: Partial<Request> = {};
    expect(async () => {
      await infoService.getInfo(req as Request);
    }).not.toThrowError();
    expect(logMock).toHaveBeenCalledWith(LogLevel.Error, expect.any(String), req, errorTest);
  });

  it('stripScriptsFromHtml: should return an empty string when passed a null value', () => {
    const infoService = new InfoService(null, null);
    const result = infoService.stripScriptsFromHtml(null);
    expect(result).toStrictEqual('');
  });

  it('stripScriptsFromHtml: should strip script tags and return a cleaned string', () => {
    const infoService = new InfoService(null, null);
    const result = infoService.stripScriptsFromHtml('Lorem <script type="text/javascript">test</script>Ipsum');
    expect(result).toStrictEqual('Lorem Ipsum');
  });
});
