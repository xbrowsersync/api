var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.Global 
 * Description: Stores global variables.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.Global = function() {
    'use strict';
    
    return {
        apiName: 'xBrowserSync-API',
        clientIpMethods: {
            xClientIp: 1,
            xForwardedFor: 2,
            remoteAddress: 3
        },
        recaptcha: {
            verificationApiUri: 'https://www.google.com/recaptcha/api/siteverify'
        },
        serviceStatuses: {
            online: 1,
            offline: 2,
            noNewSyncs: 3
        },
        version: '1.0.0'
    };
};

module.exports = xBrowserSync.API.Global();
