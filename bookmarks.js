var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.Bookmarks 
 * Description: Handles operations on bookmark data.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.Bookmarks = function() {
    'use strict';
    
    var Q = require('q');
    var restify = require('restify');
    var db = require('./db.js');
    var config = require('./config.js');
    var newSyncsLog = require('./newSyncsLog.js');

    var createBookmarks = function(req, res, next) {
        if (!!config.status.offline) {
            return next(new restify.ServiceUnavailableError());
        }
        
        if (req.params.bookmarks === undefined) {
            return next(new restify.MissingParameterError('No bookmarks provided'));
        }
        
        // Check if accepting new syncs
        db.acceptingNewSyncs()
            .then(function(acceptingNewSyncs) {
                if (!acceptingNewSyncs) {
                    return Q.reject(new restify.MethodNotAllowedError('Server not accepting new syncs'));
                }
                
                // Check daily new sync log
                return newSyncsLog.dailyNewSyncLimitHit(req);
            })
            .then(function(newSyncLimitHit) {
                if (!!newSyncLimitHit) {
                    return Q.reject(new restify.TooManyRequestsError('New syncs limit exceeded for today'));
                }

                // Create new id
                return getNewId();
            })
            .then(function(id) {
                // Create new sync
                var bookmark = {};
                bookmark._id = db.getBinaryFromUuid(id);
                bookmark.bookmarks = req.params.bookmarks;
                bookmark.lastAccessed = new Date();
                bookmark.lastUpdated = new Date();
                
                db.bookmarks().insert(bookmark, function(err, result) {
                    if (err) {
                        return next(err);
                    }
                    
                    var data = {};
                    
                    if (!!result) {
                        data.id = id;
                        data.lastUpdated = result.lastUpdated;
                        
                        // Add to log
                        newSyncsLog.createLog(req);
                    }
                    
                    res.send(200, data);
                    return next();
                });
            })
            .catch(function(err) {
                return next(err);
            });
    };
    
    var getBookmarks = function(req, res, next) {
        if (!!config.status.offline) {
            return next(new restify.ServiceUnavailableError());
        }
        
        if (req.params.id === undefined) {
            return next(new restify.MissingParameterError('No ID provided'));
        }
        
        // Get binary from id
        var binId;
        try {
            binId = db.getBinaryFromUuid(req.params.id);
        }
        catch(ex) {
            return next(new restify.InvalidArgumentError('Invalid ID'));
        }

        db.bookmarks().findOne(
            { _id: binId }, 
            function(err, result) {
                if (err) {
                    return next(err);
                }
                
                var data = {};
                
                if (result) {
                    data.bookmarks = result.bookmarks;
                    data.lastUpdated = result.lastUpdated;
                }
                
                res.send(200, data);
                return next();
            }
        );
        
        db.bookmarks().update(
            { _id: binId }, 
            { $set: { lastAccessed: new Date() } },
            function(err, result) {
                if (err) {
                    return next(err);
                }
                
                return next();
            }
        );
    };
    
    var getLastUpdated = function(req, res, next) {
        if (!!config.status.offline) {
            return next(new restify.ServiceUnavailableError());
        }
        
        if (req.params.id === undefined) {
            return next(new restify.MissingParameterError('No ID provided'));
        }
        
        // Get binary from id
        var binId;
        try {
            binId = db.getBinaryFromUuid(req.params.id);
        }
        catch(ex) {
            return next(new restify.InvalidArgumentError('Invalid ID'));
        }
        
        db.bookmarks().findOne( 
            { _id: binId }, 
            function(err, result) {
                if (err) {
                    return next(err);
                }
                
                var data = {};
                
                if (result) {
                    data.lastUpdated = result.lastUpdated;
                }
                
                res.send(200, data);
                return next();
            }
        );
        
        db.bookmarks().update(
            { _id: binId }, 
            { $set: { lastAccessed: new Date() } },
            function(err, result) {
                if (err) {
                    return next(err);
                }
                
                return next();
            }
        );
    };

    var getNewId = function() {
        var deferred = Q.defer();
        
        // Get new id and corresponding binary
        var id = db.getNewUuid();
        var binId = db.getBinaryFromUuid(id);
        
        // Check if already in use
        db.bookmarks().findOne( 
            { _id: binId }, 
            function findOneCallback(err, result) {
                if (err) {
                    return deferred.reject();
                }
                
                // If no result found, use this id
                if (!result) {
                    return deferred.resolve(id);
                }

                // Otherwise generate a new id and check again
                id = db.getNewUuid();
                binId = db.getBinaryFromUuid(id);
                db.bookmarks().findOne(
                    { _id: binId },
                    findOneCallback);
            }
        );

        return deferred.promise;
    };
    
    var updateBookmarks = function(req, res, next) {
        if (!!config.status.offline) {
            return next(new restify.ServiceUnavailableError());
        }
        
        if (req.params.bookmarks === undefined) {
            return next(new restify.MissingParameterError('Missing bookmark data'));
        }

        // Get binary from id
        var binId = db.getBinaryFromUuid(req.params.id);
        
        var bookmark = {};
        bookmark.bookmarks = req.params.bookmarks;
        bookmark.lastAccessed = new Date();
        bookmark.lastUpdated = new Date();
        
        db.bookmarks().update(
            { _id: binId }, 
            { $set: bookmark },
            function(err, result) {
                if (err) {
                    return next(err);
                }
                
                var data = {};
                
                if (result.n > 0) {
                    data.lastUpdated = bookmark.lastUpdated;
                }                
                
                res.send(200, data);
                return next();
            }
        );
    };
    
    return {
        createBookmarks: createBookmarks,
        getBookmarks: getBookmarks,
        getLastUpdated: getLastUpdated,
        updateBookmarks: updateBookmarks
    };
};

module.exports = xBrowserSync.API.Bookmarks();