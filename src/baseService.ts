import * as bunyan from 'bunyan';
import { ApiError } from './api';
const Config = require('./config.json');

// 
export default class BaseService<T> {
  protected logger: bunyan;
  protected service: T;

  constructor(service: T, logger: bunyan) {
    this.service = service;
    this.logger = logger;
  }

  // 
  protected checkServiceAvailability(): void {
    if (!Config.status.online) {
      const err = new Error();
      err.name = ApiError.ServiceNotAvailableError;
      throw err;
    }
  }
}