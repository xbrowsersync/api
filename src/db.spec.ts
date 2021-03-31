import 'jest';
import mongoose from 'mongoose';
import { LogLevel } from './common/enums';
import * as Config from './config';
import { connect, disconnect } from './db';

jest.mock('mongoose');

describe('DB', () => {
  const authSourceTest = 'authSourceTest';
  const dbNameTest = 'dbNameTest';
  const hostnameTest = 'hostnameTest';
  const passwordTest = 'passwordTest';
  const portTest = 12345;
  const usernameTest = 'usernameTest';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('connect: should call mongoose.connect', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {},
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const connectMock = jest.spyOn(mongoose, 'connect').mockImplementation();
    connect();
    expect(connectMock).toHaveBeenCalled();
  });

  it('connect: should use standard connection uri by default', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {},
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`mongodb://`));
  });

  it('connect: should use srv connection uri if specified in config settings', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        useSRV: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`mongodb\\+srv://`));
  });

  it('connect: should include username from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        username: usernameTest,
        password: passwordTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`://${usernameTest}:`));
  });

  it('connect: should include username from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        username: usernameTest,
        password: passwordTest,
        useSRV: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`://${usernameTest}:`));
  });

  it('connect: should include username from environment variables in connection uri if no username defined in config settings', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {},
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    process.env.XBROWSERSYNC_DB_USER = usernameTest;
    process.env.XBROWSERSYNC_DB_PWD = passwordTest;
    connect();
    expect(connectionUri).toMatch(new RegExp(`://${usernameTest}:`));
  });

  it('connect: should include password from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        username: usernameTest,
        password: passwordTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`://.*:${passwordTest}@`));
  });

  it('connect: should include password from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        username: usernameTest,
        password: passwordTest,
        useSRV: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`://.*:${passwordTest}@`));
  });

  it('connect: should include password from environment variables in connection uri if no password defined in config settings', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {},
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    process.env.XBROWSERSYNC_DB_USER = usernameTest;
    process.env.XBROWSERSYNC_DB_PWD = passwordTest;
    connect();
    expect(connectionUri).toMatch(new RegExp(`://.*:${passwordTest}@`));
  });

  it('connect: should include authSource from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        authSource: authSourceTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`\\?authSource=${authSourceTest}$`));
  });

  it('connect: should include authSource from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        authSource: authSourceTest,
        useSRV: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`\\?authSource=${authSourceTest}$`));
  });

  it('connect: should include hostname from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        host: hostnameTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`@${hostnameTest}`));
  });

  it('connect: should include hostname from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        host: hostnameTest,
        useSRV: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`@${hostnameTest}`));
  });

  it('connect: should include port from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        port: portTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`:${portTest}/`));
  });

  it('connect: should include db name from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        name: dbNameTest,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`/${dbNameTest}`));
  });

  it('connect: should include db name from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        name: dbNameTest,
        useSRV: true,
      },
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    connect();
    expect(connectionUri).toMatch(new RegExp(`/${dbNameTest}`));
  });

  it('connect: should exit process with error if db connection fails', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {},
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    const exitMock = jest.spyOn(process, 'exit').mockImplementation();
    const errorTest = new Error();
    jest.spyOn(mongoose, 'connect').mockRejectedValue(errorTest);
    const logMock = jest.fn();
    await connect(logMock);
    expect(exitMock).toHaveBeenCalledWith(1);
    expect(logMock).toHaveBeenCalledWith(LogLevel.Error, expect.any(String), null, errorTest);
  });

  it('disconnect: should call mongoose.disconnect', async () => {
    const disconnectMock = jest.spyOn(mongoose, 'disconnect');
    disconnect();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
