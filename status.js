var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.Status 
 * Description: Provides API for querying server status.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.Status = function() {
    'use strict';
    
    var global = require('./global.js');
    var config = require('./config.js');
    var db = require('./db.js');
    var bookmarks = require('./bookmarks.js');
    
    var getStatus = function(req, res, next) {
        var serviceStatus = {
            status: config.status,
            message: config.statusMessage
        };
        
        if (config.status === global.serviceStatuses.offline) {
            res.send(200, serviceStatus);
            return next();
        }
        
        // Check if accepting new syncs
        db.acceptingNewSyncs()
            .then(function(result) {
                serviceStatus.status = (!!result) ? 
                    global.serviceStatuses.online : global.serviceStatuses.noNewSyncs;
                
                res.send(200, serviceStatus);
                return next();
            });
    };
    
    return {
        getStatus: getStatus
    };
};

module.exports = xBrowserSync.API.Status();