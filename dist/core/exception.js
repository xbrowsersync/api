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
class ClientIpAddressEmptyException extends ExceptionBase {
    constructor(message) {
        super(message || `Unable to determine client's IP address`);
        this.name = 'ClientIpAddressEmptyException';
        this.status = 409;
    }
}
exports.ClientIpAddressEmptyException = ClientIpAddressEmptyException;
class InvalidSyncIdException extends ExceptionBase {
    constructor(message) {
        super(message || 'Invalid sync ID');
        this.name = 'InvalidSyncIdException';
        this.status = 409;
    }
}
exports.InvalidSyncIdException = InvalidSyncIdException;
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
        this.status = 404;
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
class RequestThrottledException extends ExceptionBase {
    constructor(message) {
        super(message || 'Too many requests');
        this.name = 'RequestThrottledException';
        this.status = 429;
    }
}
exports.RequestThrottledException = RequestThrottledException;
class RequiredDataNotFoundException extends ExceptionBase {
    constructor(message) {
        super(message || 'Unable to find required data');
        this.name = 'RequiredDataNotFoundException';
        this.status = 409;
    }
}
exports.RequiredDataNotFoundException = RequiredDataNotFoundException;
class ServiceNotAvailableException extends ExceptionBase {
    constructor(message) {
        super(message || 'The service is currently offline');
        this.name = 'ServiceNotAvailableException';
        this.status = 503;
    }
}
exports.ServiceNotAvailableException = ServiceNotAvailableException;
class SyncDataLimitExceededException extends ExceptionBase {
    constructor(message) {
        super(message || 'Sync data limit exceeded');
        this.name = 'SyncDataLimitExceededException';
        this.status = 413;
    }
}
exports.SyncDataLimitExceededException = SyncDataLimitExceededException;
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