import * as merge from 'deepmerge';
import * as fs from 'fs';
import * as path from 'path';

export default class Config {
  public static get(force?: boolean): any {
    if (this.config && !force) {
      return this.config;
    }

    // Get full path to config folder
    const pathToConfig = path.join(__dirname, '../config');

    // Get default settings values
    const defaultSettings = this.getDefaultSettings(pathToConfig);

    // Get user settings values if present
    const userSettings = this.getUserSettings(pathToConfig);

    // Merge default and user settings
    const settings: any = merge(defaultSettings, userSettings);

    // Get current version number
    const version = this.getPackageVersion();

    this.config = {
      ...settings,
      version
    };

    return this.config;
  }

  private static getDefaultSettings(pathToConfig: string): any {
    const pathToSettings = path.join(pathToConfig, 'settings.default.json');
    return require(pathToSettings);
  }

  public static getPackageVersion(): any {
    const packageJson = require('../package.json');
    return packageJson.version;
  }

  public static getUserSettings(pathToConfig: string): any {
    const pathToUserSettings = path.join(pathToConfig, 'settings.json');
    let userSettings = {};
    if (fs.existsSync(pathToUserSettings)) {
      userSettings = require(pathToUserSettings);
    }
    return userSettings;
  }

  private static config: any;
}