"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clientIpMethods;
(function (clientIpMethods) {
    clientIpMethods[clientIpMethods["xClientIp"] = 1] = "xClientIp";
    clientIpMethods[clientIpMethods["xForwardedFor"] = 2] = "xForwardedFor";
    clientIpMethods[clientIpMethods["remoteAddress"] = 3] = "remoteAddress";
})(clientIpMethods = exports.clientIpMethods || (exports.clientIpMethods = {}));
var serviceStatuses;
(function (serviceStatuses) {
    serviceStatuses[serviceStatuses["online"] = 1] = "online";
    serviceStatuses[serviceStatuses["offline"] = 2] = "offline";
    serviceStatuses[serviceStatuses["noNewSyncs"] = 3] = "noNewSyncs";
})(serviceStatuses = exports.serviceStatuses || (exports.serviceStatuses = {}));
//# sourceMappingURL=constants.js.map