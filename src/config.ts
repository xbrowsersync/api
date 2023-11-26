import merge from 'deepmerge';
import fs from 'fs';
import path from 'path';

export interface IConfigSettings {
  allowedOrigins?: string[];
  dailyNewSyncsLimit?: number;
  db?: {
    type?: 'mysql' | 'mariadb' | 'postgres' | 'sqlite';
    connTimeout?: number;
    host?: string;
    name?: string;
    ssl?: boolean;
    username?: string;
    password?: string;
    port?: number;
    // For sqlite database file
    filepath?: string;
  };
  location?: string;
  log?: {
    file?: {
      enabled?: boolean;
      level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
      path?: string;
      rotatedFilesToKeep?: number;
      rotationPeriod?: string;
    };
    stdout?: {
      enabled?: boolean;
      level?: string;
    };
  };
  maxSyncs?: number;
  maxSyncSize?: number;
  server?: {
    behindProxy?: boolean;
    host?: string;
    https?: {
      certPath?: string;
      enabled?: boolean;
      keyPath?: string;
    };
    port?: number;
    relativePath?: string;
  };
  status?: {
    allowNewSyncs?: boolean;
    message?: string;
    online?: boolean;
  };
  tests?: {
    db?: string;
    port?: number;
  };
  throttle?: {
    maxRequests?: number;
    timeWindow?: number;
  };
  version?: string;
}

let cachedConfig: IConfigSettings;
export const getCachedConfig = (): IConfigSettings => {
  return cachedConfig;
};
export const setCachedConfig = (value: IConfigSettings): void => {
  cachedConfig = value;
};

// Returns combined default and user-specified config settings
export const get = (force?: boolean): IConfigSettings => {
  if (getCachedConfig() && !force) {
    return getCachedConfig();
  }

  // Get full path to config folder
  const pathToConfig = path.join(__dirname, '../config');

  // Get default settings values
  const defaultSettings = getDefaultSettings();

  // Get user settings values if present
  let userSettings = getUserSettings([pathToConfig, '/', '/usr/src/app/']);

  // Merge default and user settings
  const settings: any = merge(defaultSettings, userSettings);

  // Get current version number
  const version = getPackageVersion();

  setCachedConfig({
    ...settings,
    version,
  });

  return getCachedConfig();
};

// Returns default config settings
const getDefaultSettings = (): IConfigSettings => {
  return require('./config.default').default;
};

// Returns version number from package.json
export const getPackageVersion = (): string => {
  const config = require('./config.default').default;
  return config.version;
};

// Returns user-specified config settings
export const getUserSettings = (pathsToConfig: string[]): IConfigSettings => {
  let userSettings: IConfigSettings = {};

  for (let i in pathsToConfig) {
    const folder = pathsToConfig[i];
    const pathToUserSettings = path.join(folder, 'settings.json');

    if (fs.existsSync(pathToUserSettings)) {
      try {
        userSettings = require(pathToUserSettings);
      } catch (e) {
        console.error('Error loading ' + pathToUserSettings + '. Check valid JSON syntax');
      }

      return userSettings;
    }
  }

  return userSettings;
};
