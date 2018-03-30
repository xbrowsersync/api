import { Request } from 'express';
import { ApiError, LogLevel } from './api';

// 
export default class BaseService<T> {
  protected config = require('./config.json');
  protected log: (level: LogLevel, message: string, req?: Request, err?: Error) => void;
  protected service: T;

  constructor(service: T, log: (level: LogLevel, message: string, req?: Request, err?: Error) => void) {
    this.service = service;
    this.log = log;
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