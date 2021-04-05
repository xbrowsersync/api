"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verb = exports.ServiceStatus = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Error"] = 0] = "Error";
    LogLevel[LogLevel["Info"] = 1] = "Info";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus[ServiceStatus["online"] = 1] = "online";
    ServiceStatus[ServiceStatus["offline"] = 2] = "offline";
    ServiceStatus[ServiceStatus["noNewSyncs"] = 3] = "noNewSyncs";
})(ServiceStatus = exports.ServiceStatus || (exports.ServiceStatus = {}));
var Verb;
(function (Verb) {
    Verb["delete"] = "delete";
    Verb["get"] = "get";
    Verb["options"] = "options";
    Verb["patch"] = "patch";
    Verb["post"] = "post";
    Verb["put"] = "put";
})(Verb = exports.Verb || (exports.Verb = {}));
