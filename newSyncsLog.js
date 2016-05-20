var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.NewSyncsLog 
 * Description: Provides API for logging new syncs.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.NewSyncsLog = function() {
    'use strict';
    
    var Q = require('q');
    var global = require('./global.js');
    var config = require('./config.js');
    var db = require('./db.js');
    
    var clearLog = function() {
        var deferred = Q.defer();
        
        // Remove log entries older than today
        db.newSyncsLog().remove(
            { 
                syncCreated: { 
                    $lt: (new Date(new Date().toJSON().slice(0,10))) 
                }
            },
            function(err, result) {
                if (!!err) {
                    return deferred.reject(err);
                }
                
                deferred.resolve();
            }
        );
        
        return deferred.promise;
    };
    
    var createLog = function(req) {
        var ipAddress = getIpAddress(req);
        
        if (!ipAddress) {
            return;
        }
        
        var newLog = {
            ipAddress: ipAddress,
            syncCreated: new Date()
        };
        
        // Add new log entry
        db.newSyncsLog().save(newLog, function(err, result) {
            if (err) {
                return next(err);
            }
        });
    };
    
    var dailyNewSyncLimitHit = function(req) {
        var ipAddress = getIpAddress(req);
        
        if (!ipAddress) {
            return Q.resolve(false);
        }
        
        var deferred = Q.defer();
        
        // Clear new syncs log of old entries
        clearLog()
            .then(function() {
                // Get number of new syncs created by this ip
                db.newSyncsLog().count(
                    { ipAddress: ipAddress },
                    function(err, count) {
                        if (!!err) {
                            return deferred.reject(err);
                        }
                        
                        deferred.resolve(count >= config.dailyNewSyncLimit);
                    }
                );
            })
            .catch(function(err) {
                deferred.reject(err);
            });
        
        return deferred.promise;
    };
    
    var getIpAddress = function(req) {
        var methodOrder = config.clientIpMethodOrder;
        var ipAddress; 
        
        // Iterate through the desired methods to get client ip and return the
        // first valid value
        for (var i = 0; i < methodOrder.length; i++) {
            switch (methodOrder[i]) {
                case global.clientIpMethods.xClientIp:
                    ipAddress = req.headers['x-client-ip'];
                    break;
                case global.clientIpMethods.xForwardedFor:
                    ipAddress = req.headers['x-forwarded-for'];
                    break;
                case global.clientIpMethods.remoteAddress:
                    ipAddress = req.connection.remoteAddress;
                    break;
            }
            
            if (!!ipAddress) {
                return ipAddress;
            }
        }
        
        return req.headers['x-client-ip'];
    };
    
    return {
        createLog: createLog,
        dailyNewSyncLimitHit: dailyNewSyncLimitHit
    };
};

module.exports = xBrowserSync.API.NewSyncsLog();