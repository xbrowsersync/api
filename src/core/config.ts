import * as merge from 'deepmerge';
import * as fs from 'fs';
import * as path from 'path';

export default class Config {
  public static get(force?: boolean): any {
    if (this.config && !force) {
      return this.config;
    }

    // Get full path to config folder
    const pathToConfig = path.join(__dirname, '../../config');

    // Get default settings values
    const pathToSettings = path.join(pathToConfig, 'settings.default.json');
    const defaultSettings = require(pathToSettings);

    // Get user settings values if present
    const pathToUserSettings = path.join(pathToConfig, 'settings.json');
    let userSettings = {};
    if (fs.existsSync(pathToUserSettings)) {
      userSettings = require(pathToUserSettings);
    }

    // Merge default and user settings
    const settings: any = merge(defaultSettings, userSettings);

    // Get current version number
    const { version } = require('../../package.json');

    this.config = {
      ...settings,
      version
    };

    return this.config;
  }

  private static config: any;
}