// Base class for custom api exceptions
export class ExceptionBase extends Error {
  public message: string;
  public name: string;
  public status: number;  
  
  constructor(message: string) {
    super(message);
  }

  public getResponseObject(): any {
    return {
      code: this.name,
      message: this.message
    };
  }
}

export class BookmarksDataLimitExceededException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'Bookmarks data limit exceeded');
    this.name = 'BookmarksDataLimitExceededException';
    this.status = 413;
  }
}

export class BookmarksDataNotFoundException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'Unable to find bookmarks data');
    this.name = 'BookmarksDataNotFoundException';
    this.status = 409;
  }
}

export class ClientIpAddressEmptyException extends ExceptionBase {
  constructor(message?: string) {
    super(message || `Unable to determine client's IP address`);
    this.name = 'ClientIpAddressEmptyException';
    this.status = 409;
  }
}

export class NewSyncsForbiddenException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'The service is not accepting new syncs');
    this.name = 'NewSyncsForbiddenException';
    this.status = 405;
  }
}

export class NewSyncsLimitExceededException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'Client has exceeded the daily new syncs limit');
    this.name = 'NewSyncsLimitExceededException';
    this.status = 406;
  }
}

export class NotImplementedException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'The requested route has not been implemented');
    this.name = 'NotImplementedException';
    this.status = 500;
  }
}

export class OriginNotPermittedException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'Client not permitted to access this service');
    this.name = 'OriginNotPermittedException';
    this.status = 405;
  }
}

export class ServiceNotAvailableException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'The service is currently offline');
    this.name = 'ServiceNotAvailableException';
    this.status = 405;
  }
}

export class SyncIdNotFoundException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'Unable to find sync ID');
    this.name = 'SyncIdNotFoundException';
    this.status = 409;
  }
}

export class UnspecifiedException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'An unspecified error has occurred');
    this.name = 'UnspecifiedException';
    this.status = 500;
  }
}

export class UnsupportedVersionException extends ExceptionBase {
  constructor(message?: string) {
    super(message || 'The requested API version is not supported');
    this.name = 'UnsupportedVersionException';
    this.status = 405;
  }
}