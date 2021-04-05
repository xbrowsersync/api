/* eslint-disable max-classes-per-file */

// Base class for custom api exceptions
export class ApiException extends Error {
  message: string;
  name: string;
  status: number;

  getResponseObject(): any {
    return {
      code: this.name,
      message: this.message,
    };
  }
}

export class InvalidArgumentException extends Error {
  constructor(message?: string) {
    super(message || 'Supplied argument has incorrect type');
    this.name = 'InvalidArgumentException';
  }
}

export class InvalidSyncIdException extends ApiException {
  constructor(message?: string) {
    super(message || 'Invalid sync ID');
    this.name = 'InvalidSyncIdException';
    this.status = 401; // Unauthorized
  }
}

export class SyncNotFoundException extends ApiException {
  constructor(message?: string) {
    super(message || 'Sync does not exist');
    this.name = 'SyncNotFoundException';
    this.status = 401; // Unauthorized
  }
}

export class RequiredDataNotFoundException extends ApiException {
  constructor(message?: string) {
    super(message || 'Unable to find required data');
    this.name = 'RequiredDataNotFoundException';
    this.status = 400; // Bad Request
  }
}

export class NewSyncsForbiddenException extends ApiException {
  constructor(message?: string) {
    super(message || 'The service is not accepting new syncs');
    this.name = 'NewSyncsForbiddenException';
    this.status = 405; // Method Not Allowed
  }
}

export class NewSyncsLimitExceededException extends ApiException {
  constructor(message?: string) {
    super(message || 'Client has exceeded the daily new syncs limit');
    this.name = 'NewSyncsLimitExceededException';
    this.status = 406; // Not Acceptable
  }
}

export class NotImplementedException extends ApiException {
  constructor(message?: string) {
    super(message || 'The requested route has not been implemented');
    this.name = 'NotImplementedException';
    this.status = 404; // Not Found
  }
}

export class SyncConflictException extends ApiException {
  constructor(message?: string) {
    super(message || 'A sync conflict was detected');
    this.name = 'SyncConflictException';
    this.status = 409; // Conflict
  }
}

export class UnsupportedVersionException extends ApiException {
  constructor(message?: string) {
    super(message || 'The requested API version is not supported');
    this.name = 'UnsupportedVersionException';
    this.status = 412; // Precondition Failed
  }
}

export class SyncDataLimitExceededException extends ApiException {
  constructor(message?: string) {
    super(message || 'Sync data limit exceeded');
    this.name = 'SyncDataLimitExceededException';
    this.status = 413; // Payload Too Large
  }
}

export class RequestThrottledException extends ApiException {
  constructor(message?: string) {
    super(message || 'Too many requests');
    this.name = 'RequestThrottledException';
    this.status = 429; // Too Many Requests
  }
}

export class OriginNotPermittedException extends ApiException {
  constructor(message?: string) {
    super(message || 'Client not permitted to access this service');
    this.name = 'OriginNotPermittedException';
    this.status = 500; // Internal Server Error
  }
}

export class UnspecifiedException extends ApiException {
  constructor(message?: string) {
    super(message || 'An unspecified error has occurred');
    this.name = 'UnspecifiedException';
    this.status = 500; // Internal Server Error
  }
}

export class ServiceNotAvailableException extends ApiException {
  constructor(message?: string) {
    super(message || 'The service is currently offline');
    this.name = 'ServiceNotAvailableException';
    this.status = 503; // Service Unavailable
  }
}
