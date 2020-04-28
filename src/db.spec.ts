import 'jest';
import * as DB from './db';
import * as Config from './config';
import * as mongoose from 'mongoose';

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
    const connectMock = jest.spyOn(mongoose, 'connect');
    DB.connect();
    expect(connectMock).toHaveBeenCalled();
  });

  it('connect: should use standard connection uri by default', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {}
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`mongodb\:\/\/`));
  });

  it('connect: should use srv connection uri if specified in config settings', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        useSRV: true
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`mongodb\\+srv\:\/\/`));
  });

  it('connect: should include username from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        username: usernameTest
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\:\/\/${usernameTest}\:`));
  });

  it('connect: should include username from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        username: usernameTest,
        useSRV: true
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\:\/\/${usernameTest}\:`));
  });

  it('connect: should include username from environment variables in connection uri if no username defined in config settings', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {}
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    process.env.XBROWSERSYNC_DB_USER = usernameTest;
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\:\/\/${usernameTest}\:`));
  });

  it('connect: should include password from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        password: passwordTest
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\:\/\/.*\:${passwordTest}@`));
  });

  it('connect: should include password from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        password: passwordTest,
        useSRV: true
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\:\/\/.*\:${passwordTest}@`));
  });

  it('connect: should include password from environment variables in connection uri if no password defined in config settings', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {}
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    process.env.XBROWSERSYNC_DB_PWD = passwordTest;
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\:\/\/.*\:${passwordTest}@`));
  });

  it('connect: should include authSource from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        authSource: authSourceTest
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\\?authSource=${authSourceTest}$`));
  });

  it('connect: should include authSource from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        authSource: authSourceTest,
        useSRV: true
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\\?authSource=${authSourceTest}$`));
  });

  it('connect: should include hostname from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        host: hostnameTest
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`@${hostnameTest}`));
  });

  it('connect: should include hostname from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        host: hostnameTest,
        useSRV: true
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`@${hostnameTest}`));
  });

  it('connect: should include port from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        port: portTest
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\:${portTest}\/`));
  });

  it('connect: should include db name from config settings in standard connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        name: dbNameTest
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\/${dbNameTest}`));
  });

  it('connect: should include db name from config settings in srv connection uri', async () => {
    const configSettingsTest: Config.IConfigSettings = {
      db: {
        name: dbNameTest,
        useSRV: true
      }
    };
    jest.spyOn(Config, 'get').mockReturnValue(configSettingsTest);
    let connectionUri: string;
    jest.spyOn(mongoose, 'connect').mockImplementation((...args) => {
      connectionUri = args[0];
      return Promise.resolve(require('mongoose'));
    });
    DB.connect();
    expect(connectionUri).toMatch(new RegExp(`\/${dbNameTest}`));
  });

  it('disconnect: should call mongoose.disconnect', async () => {
    const disconnectMock = jest.spyOn(mongoose, 'disconnect');
    DB.disconnect();
    expect(disconnectMock).toHaveBeenCalled();
  });
});