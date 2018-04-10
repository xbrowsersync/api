"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Base class for custom api exceptions
class ExceptionBase extends Error {
    constructor(message) {
        super(message);
    }
    getResponseObject() {
        return {
            code: this.name,
            message: this.message
        };
    }
}
exports.ExceptionBase = ExceptionBase;
class BookmarksDataLimitExceededException extends ExceptionBase {
    constructor(message) {
        super(message || 'Bookmarks data limit exceeded');
        this.name = 'BookmarksDataLimitExceededException';
        this.status = 413;
    }
}
exports.BookmarksDataLimitExceededException = BookmarksDataLimitExceededException;
class BookmarksDataNotFoundException extends ExceptionBase {
    constructor(message) {
        super(message || 'Unable to find bookmarks data');
        this.name = 'BookmarksDataNotFoundException';
        this.status = 409;
    }
}
exports.BookmarksDataNotFoundException = BookmarksDataNotFoundException;
class ClientIpAddressEmptyException extends ExceptionBase {
    constructor(message) {
        super(message || `Unable to determine client's IP address`);
        this.name = 'ClientIpAddressEmptyException';
        this.status = 409;
    }
}
exports.ClientIpAddressEmptyException = ClientIpAddressEmptyException;
class NewSyncsForbiddenException extends ExceptionBase {
    constructor(message) {
        super(message || 'The service is not accepting new syncs');
        this.name = 'NewSyncsForbiddenException';
        this.status = 405;
    }
}
exports.NewSyncsForbiddenException = NewSyncsForbiddenException;
class NewSyncsLimitExceededException extends ExceptionBase {
    constructor(message) {
        super(message || 'Client has exceeded the daily new syncs limit');
        this.name = 'NewSyncsLimitExceededException';
        this.status = 406;
    }
}
exports.NewSyncsLimitExceededException = NewSyncsLimitExceededException;
class NotImplementedException extends ExceptionBase {
    constructor(message) {
        super(message || 'The requested route has not been implemented');
        this.name = 'NotImplementedException';
        this.status = 500;
    }
}
exports.NotImplementedException = NotImplementedException;
class OriginNotPermittedException extends ExceptionBase {
    constructor(message) {
        super(message || 'Client not permitted to access this service');
        this.name = 'OriginNotPermittedException';
        this.status = 405;
    }
}
exports.OriginNotPermittedException = OriginNotPermittedException;
class ServiceNotAvailableException extends ExceptionBase {
    constructor(message) {
        super(message || 'The service is currently offline');
        this.name = 'ServiceNotAvailableException';
        this.status = 405;
    }
}
exports.ServiceNotAvailableException = ServiceNotAvailableException;
class SyncIdNotFoundException extends ExceptionBase {
    constructor(message) {
        super(message || 'Unable to find sync ID');
        this.name = 'SyncIdNotFoundException';
        this.status = 409;
    }
}
exports.SyncIdNotFoundException = SyncIdNotFoundException;
class UnspecifiedException extends ExceptionBase {
    constructor(message) {
        super(message || 'An unspecified error has occurred');
        this.name = 'UnspecifiedException';
        this.status = 500;
    }
}
exports.UnspecifiedException = UnspecifiedException;
class UnsupportedVersionException extends ExceptionBase {
    constructor(message) {
        super(message || 'The requested API version is not supported');
        this.name = 'UnsupportedVersionException';
        this.status = 405;
    }
}
exports.UnsupportedVersionException = UnsupportedVersionException;
//# sourceMappingURL=exception.js.map