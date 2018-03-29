import * as bunyan from 'bunyan';
import { ApiError } from './api';

// 
export default class BaseService<T> {
  protected config = require('./config.json');  
  protected logger: bunyan;
  protected service: T;

  constructor(service: T, logger: bunyan) {
    this.service = service;
    this.logger = logger;
  }

  // 
  protected checkServiceAvailability(): void {
    if (!this.config.status.online) {
      const err = new Error();
      err.name = ApiError.ServiceNotAvailableError;
      throw err;
    }
  }
}