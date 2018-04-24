import * as merge from 'deepmerge';
import * as fs from 'fs';
import * as path from 'path';

export default class Config {
  public static get(): any {
    if (this.config) {
      return this.config;
    }
    
    // Get default settings values
    const defaultSettings = require('../config/settings.default.json');
    
    // Get user settings values if present
    let userSettings = {};    
    if (fs.existsSync(path.join(__dirname, '../config', 'settings.json'))) {
      userSettings = require('../config/settings.json');
    }

    // Merge default and user settings
    const settings = merge(defaultSettings, userSettings);
    
    // Get current version number
    const version = require('../config/version.json');

    this.config = {
      ...settings,
      ...version
    };

    return this.config;
  }

  private static config: any;
}