export default class Config {
  public static get(): any {
    const settings = require('../config/settings.json');
    const version = require('../config/version.json');

    return {
      ...settings,
      ...version
    };
  }
}