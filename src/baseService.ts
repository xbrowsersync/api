import { Request } from 'express';
import { ServiceNotAvailableException } from './exception';
import { LogLevel } from './server';
const Config = require('./config.json');

// Base class for data service implementations
// Implements the functionality executed when calling a route
export default class BaseService<T> {
  protected log: (level: LogLevel, message: string, req?: Request, err?: Error) => void;
  protected service: T;

  constructor(service: T, log: (level: LogLevel, message: string, req?: Request, err?: Error) => void) {
    this.service = service;
    this.log = log;
  }

  // Throws an error if the service status is set to offline in config
  protected checkServiceAvailability(): void {
    if (!Config.status.online) {
      throw new ServiceNotAvailableException();
    }
  }
}