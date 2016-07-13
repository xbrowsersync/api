var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.DB 
 * Description: Provides database connectivity for the API.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.DB = function() {
    'use strict';
    
    var mongojs = require('mongojs');
    var Q = require('q');
    var uuid = require('node-uuid');
    var config = require('./config.js');
    
    var db, bookmarks, newSyncsLog;
    
    var connect = function() {
        db = mongojs(
            config.db.username + ':' +
            config.db.password + '@' +
            config.db.host + '/' +
            config.db.name);
    };

    var getBinaryFromUuid = function(uuid) {
        return mongojs.Binary(new Buffer(uuid, 'hex'), mongojs.Binary.SUBTYPE_UUID);
    };
    
    var getBookmarks = function() {
        if (!bookmarks) {
            bookmarks = db.collection('bookmarks');
        }
        
        return bookmarks;
    };
    
    var checkAcceptingNewSyncs = function() {
        // Check config variable first
        if (!config.allowNewSyncs) {
            return Q.resolve(false);
        }
        
        // Check if total syncs have reached limit set in config  
        return getTotalSyncs()
            .then(function(result) {
                if (result >= config.maxSyncs) {
                    return false;
                }
                
                return true;
            });
    };
    
    var getNewSyncsLog = function() {
        if (!newSyncsLog) {
            newSyncsLog = db.collection('newSyncsLog');
        }
        
        return newSyncsLog;
    };

    var getNewUuid = function() {
        var bytes = uuid.v4(null, new Buffer(16));
        return new Buffer(bytes, 'base64').toString('hex');
    };
    
    var getTotalSyncs = function() {
        var bookmarksDef = Q.defer();
        var getTotalDef = Q.defer();
        var totalSyncs = 0;
        
        // Count all bookmark syncs
        getBookmarks().count(
            function(err, result) {
                if (!!err) {
                    bookmarksDef.reject(err);
                    return;
                }
                
                bookmarksDef.resolve(result);
            });
        
        // Return total syncs
        Q.all([ bookmarksDef.promise ])
            .then(function(result) {
                var totalBookmarks = result[0];                
                totalSyncs += totalBookmarks;
                
                getTotalDef.resolve(totalSyncs);
            });
        
        return getTotalDef.promise;
    };
    
    return {
        acceptingNewSyncs: checkAcceptingNewSyncs,
        bookmarks: getBookmarks,
        connect: connect,
        getBinaryFromUuid: getBinaryFromUuid,
        getNewUuid: getNewUuid,
        newSyncsLog: getNewSyncsLog
    };
};

module.exports = xBrowserSync.API.DB();