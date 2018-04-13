export default class Config {
  public static get(): any {
    return require('../config/config.json');
  }
}