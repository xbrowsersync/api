var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.Status 
 * Description: Provides API for querying server status.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.Status = function() {
    'use strict';
    
    var config = require('./config.js');
    var db = require('./db.js');
    var bookmarks = require('./bookmarks.js');
    
    var statuses = {
        online: 1
    };
    
    var getStatus = function(req, res, next) {
        var status = {
            status: statuses.online,
            message: config.statusMessage,
            acceptingNewSyncs: true
        };
        
        // Check if accepting new syncs
        db.acceptingNewSyncs()
            .then(function(result) {
                status.acceptingNewSyncs = result;
                
                res.send(200, status);
                return next();
            });
    };
    
    return {
        getStatus: getStatus
    };
};

module.exports = xBrowserSync.API.Status();