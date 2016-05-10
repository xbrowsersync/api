var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.Status 
 * Description: Provides API for querying server status.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.Status = function() {
    'use strict';
    
    var config = require('./config.js');
    var bookmarks = require('./bookmarks.js');
    
    var status = {
        online: 1
    };
    
    var getStatus = function(req, res, next) {
        var result = {
            status: status.online,
            acceptingNewSyncs: true
        };
        
        getAcceptingNewSyncs(result, function(result) {
            res.send(200, result);
            return next();
        });
    };
    
    var getAcceptingNewSyncs = function(result, callback) {
        if (!config.allowNewSyncs) {
            result.acceptingNewSyncs = false;
            return callback(result);
        }

        bookmarks.count(function(count) {
            if (count >= config.maxSyncs) {
                result.acceptingNewSyncs = false;
            }
            
            return callback(result);
        });
    };
    
    return {
        getStatus: getStatus
    };
};

module.exports = xBrowserSync.API.Status();