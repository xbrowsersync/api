"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Base class for custom api exceptions
var ExceptionBase = /** @class */ (function (_super) {
    __extends(ExceptionBase, _super);
    function ExceptionBase(message) {
        return _super.call(this, message) || this;
    }
    ExceptionBase.prototype.getResponseObject = function () {
        return {
            code: this.name,
            message: this.message
        };
    };
    return ExceptionBase;
}(Error));
exports.ExceptionBase = ExceptionBase;
var RequiredDataNotFoundException = /** @class */ (function (_super) {
    __extends(RequiredDataNotFoundException, _super);
    function RequiredDataNotFoundException(message) {
        var _this = _super.call(this, message || 'Unable to find required data') || this;
        _this.name = 'RequiredDataNotFoundException';
        _this.status = 400; // Bad Request
        return _this;
    }
    return RequiredDataNotFoundException;
}(ExceptionBase));
exports.RequiredDataNotFoundException = RequiredDataNotFoundException;
var InvalidSyncIdException = /** @class */ (function (_super) {
    __extends(InvalidSyncIdException, _super);
    function InvalidSyncIdException(message) {
        var _this = _super.call(this, message || 'Invalid sync ID') || this;
        _this.name = 'InvalidSyncIdException';
        _this.status = 401; // Unauthorized
        return _this;
    }
    return InvalidSyncIdException;
}(ExceptionBase));
exports.InvalidSyncIdException = InvalidSyncIdException;
var NotImplementedException = /** @class */ (function (_super) {
    __extends(NotImplementedException, _super);
    function NotImplementedException(message) {
        var _this = _super.call(this, message || 'The requested route has not been implemented') || this;
        _this.name = 'NotImplementedException';
        _this.status = 404; // Not Found
        return _this;
    }
    return NotImplementedException;
}(ExceptionBase));
exports.NotImplementedException = NotImplementedException;
var NewSyncsForbiddenException = /** @class */ (function (_super) {
    __extends(NewSyncsForbiddenException, _super);
    function NewSyncsForbiddenException(message) {
        var _this = _super.call(this, message || 'The service is not accepting new syncs') || this;
        _this.name = 'NewSyncsForbiddenException';
        _this.status = 405; // Method Not Allowed
        return _this;
    }
    return NewSyncsForbiddenException;
}(ExceptionBase));
exports.NewSyncsForbiddenException = NewSyncsForbiddenException;
var NewSyncsLimitExceededException = /** @class */ (function (_super) {
    __extends(NewSyncsLimitExceededException, _super);
    function NewSyncsLimitExceededException(message) {
        var _this = _super.call(this, message || 'Client has exceeded the daily new syncs limit') || this;
        _this.name = 'NewSyncsLimitExceededException';
        _this.status = 406; // Not Acceptable
        return _this;
    }
    return NewSyncsLimitExceededException;
}(ExceptionBase));
exports.NewSyncsLimitExceededException = NewSyncsLimitExceededException;
var SyncConflictException = /** @class */ (function (_super) {
    __extends(SyncConflictException, _super);
    function SyncConflictException(message) {
        var _this = _super.call(this, message || 'A sync conflict was detected') || this;
        _this.name = 'SyncConflictException';
        _this.status = 409; // Conflict
        return _this;
    }
    return SyncConflictException;
}(ExceptionBase));
exports.SyncConflictException = SyncConflictException;
var UnsupportedVersionException = /** @class */ (function (_super) {
    __extends(UnsupportedVersionException, _super);
    function UnsupportedVersionException(message) {
        var _this = _super.call(this, message || 'The requested API version is not supported') || this;
        _this.name = 'UnsupportedVersionException';
        _this.status = 412; // Precondition Failed
        return _this;
    }
    return UnsupportedVersionException;
}(ExceptionBase));
exports.UnsupportedVersionException = UnsupportedVersionException;
var SyncDataLimitExceededException = /** @class */ (function (_super) {
    __extends(SyncDataLimitExceededException, _super);
    function SyncDataLimitExceededException(message) {
        var _this = _super.call(this, message || 'Sync data limit exceeded') || this;
        _this.name = 'SyncDataLimitExceededException';
        _this.status = 413; // Payload Too Large
        return _this;
    }
    return SyncDataLimitExceededException;
}(ExceptionBase));
exports.SyncDataLimitExceededException = SyncDataLimitExceededException;
var RequestThrottledException = /** @class */ (function (_super) {
    __extends(RequestThrottledException, _super);
    function RequestThrottledException(message) {
        var _this = _super.call(this, message || 'Too many requests') || this;
        _this.name = 'RequestThrottledException';
        _this.status = 429; // Too Many Requests
        return _this;
    }
    return RequestThrottledException;
}(ExceptionBase));
exports.RequestThrottledException = RequestThrottledException;
var OriginNotPermittedException = /** @class */ (function (_super) {
    __extends(OriginNotPermittedException, _super);
    function OriginNotPermittedException(message) {
        var _this = _super.call(this, message || 'Client not permitted to access this service') || this;
        _this.name = 'OriginNotPermittedException';
        _this.status = 500; // Internal Server Error
        return _this;
    }
    return OriginNotPermittedException;
}(ExceptionBase));
exports.OriginNotPermittedException = OriginNotPermittedException;
var UnspecifiedException = /** @class */ (function (_super) {
    __extends(UnspecifiedException, _super);
    function UnspecifiedException(message) {
        var _this = _super.call(this, message || 'An unspecified error has occurred') || this;
        _this.name = 'UnspecifiedException';
        _this.status = 500; // Internal Server Error
        return _this;
    }
    return UnspecifiedException;
}(ExceptionBase));
exports.UnspecifiedException = UnspecifiedException;
var ServiceNotAvailableException = /** @class */ (function (_super) {
    __extends(ServiceNotAvailableException, _super);
    function ServiceNotAvailableException(message) {
        var _this = _super.call(this, message || 'The service is currently offline') || this;
        _this.name = 'ServiceNotAvailableException';
        _this.status = 503; // Service Unavailable
        return _this;
    }
    return ServiceNotAvailableException;
}(ExceptionBase));
exports.ServiceNotAvailableException = ServiceNotAvailableException;
//# sourceMappingURL=exception.js.map