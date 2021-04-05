"use strict";
/* eslint-disable max-classes-per-file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceNotAvailableException = exports.UnspecifiedException = exports.OriginNotPermittedException = exports.RequestThrottledException = exports.SyncDataLimitExceededException = exports.UnsupportedVersionException = exports.SyncConflictException = exports.NotImplementedException = exports.NewSyncsLimitExceededException = exports.NewSyncsForbiddenException = exports.RequiredDataNotFoundException = exports.SyncNotFoundException = exports.InvalidSyncIdException = exports.InvalidArgumentException = exports.ApiException = void 0;
// Base class for custom api exceptions
class ApiException extends Error {
    getResponseObject() {
        return {
            code: this.name,
            message: this.message,
        };
    }
}
exports.ApiException = ApiException;
class InvalidArgumentException extends Error {
    constructor(message) {
        super(message || 'Supplied argument has incorrect type');
        this.name = 'InvalidArgumentException';
    }
}
exports.InvalidArgumentException = InvalidArgumentException;
class InvalidSyncIdException extends ApiException {
    constructor(message) {
        super(message || 'Invalid sync ID');
        this.name = 'InvalidSyncIdException';
        this.status = 401; // Unauthorized
    }
}
exports.InvalidSyncIdException = InvalidSyncIdException;
class SyncNotFoundException extends ApiException {
    constructor(message) {
        super(message || 'Sync does not exist');
        this.name = 'SyncNotFoundException';
        this.status = 401; // Unauthorized
    }
}
exports.SyncNotFoundException = SyncNotFoundException;
class RequiredDataNotFoundException extends ApiException {
    constructor(message) {
        super(message || 'Unable to find required data');
        this.name = 'RequiredDataNotFoundException';
        this.status = 400; // Bad Request
    }
}
exports.RequiredDataNotFoundException = RequiredDataNotFoundException;
class NewSyncsForbiddenException extends ApiException {
    constructor(message) {
        super(message || 'The service is not accepting new syncs');
        this.name = 'NewSyncsForbiddenException';
        this.status = 405; // Method Not Allowed
    }
}
exports.NewSyncsForbiddenException = NewSyncsForbiddenException;
class NewSyncsLimitExceededException extends ApiException {
    constructor(message) {
        super(message || 'Client has exceeded the daily new syncs limit');
        this.name = 'NewSyncsLimitExceededException';
        this.status = 406; // Not Acceptable
    }
}
exports.NewSyncsLimitExceededException = NewSyncsLimitExceededException;
class NotImplementedException extends ApiException {
    constructor(message) {
        super(message || 'The requested route has not been implemented');
        this.name = 'NotImplementedException';
        this.status = 404; // Not Found
    }
}
exports.NotImplementedException = NotImplementedException;
class SyncConflictException extends ApiException {
    constructor(message) {
        super(message || 'A sync conflict was detected');
        this.name = 'SyncConflictException';
        this.status = 409; // Conflict
    }
}
exports.SyncConflictException = SyncConflictException;
class UnsupportedVersionException extends ApiException {
    constructor(message) {
        super(message || 'The requested API version is not supported');
        this.name = 'UnsupportedVersionException';
        this.status = 412; // Precondition Failed
    }
}
exports.UnsupportedVersionException = UnsupportedVersionException;
class SyncDataLimitExceededException extends ApiException {
    constructor(message) {
        super(message || 'Sync data limit exceeded');
        this.name = 'SyncDataLimitExceededException';
        this.status = 413; // Payload Too Large
    }
}
exports.SyncDataLimitExceededException = SyncDataLimitExceededException;
class RequestThrottledException extends ApiException {
    constructor(message) {
        super(message || 'Too many requests');
        this.name = 'RequestThrottledException';
        this.status = 429; // Too Many Requests
    }
}
exports.RequestThrottledException = RequestThrottledException;
class OriginNotPermittedException extends ApiException {
    constructor(message) {
        super(message || 'Client not permitted to access this service');
        this.name = 'OriginNotPermittedException';
        this.status = 500; // Internal Server Error
    }
}
exports.OriginNotPermittedException = OriginNotPermittedException;
class UnspecifiedException extends ApiException {
    constructor(message) {
        super(message || 'An unspecified error has occurred');
        this.name = 'UnspecifiedException';
        this.status = 500; // Internal Server Error
    }
}
exports.UnspecifiedException = UnspecifiedException;
class ServiceNotAvailableException extends ApiException {
    constructor(message) {
        super(message || 'The service is currently offline');
        this.name = 'ServiceNotAvailableException';
        this.status = 503; // Service Unavailable
    }
}
exports.ServiceNotAvailableException = ServiceNotAvailableException;
