var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.Bookmarks 
 * Description: Provides API for operations on bookmark data.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.Bookmarks = function() {
    'use strict';
    
    var restify = require('restify');
    var mongojs = require('mongojs');
    var config = require('./config.js');
    var db = require('./db.js');
    
    var createBookmarks = function(req, res, next) {
        if (req.params.bookmarks === undefined) {
            return next(new restify.MissingParameterError("No bookmarks provided."));
        };
        
        if (!req.params.secretHash) {
            return next(new restify.MissingParameterError("No secret hash provided."));
        };
        
        // Check if accepting new syncs
        db.acceptingNewSyncs()
            .then(function(result) {
                if (!result) {
                    return next(new restify.MethodNotAllowedError("Server not accepting new syncs."));
                }
                
                var bookmark = {};
                bookmark.bookmarks = req.params.bookmarks;
                bookmark.secretHash = req.params.secretHash;
                bookmark.lastAccessed = new Date();
                bookmark.lastUpdated = new Date();
                
                db.bookmarks().save(bookmark, function(err, result) {
                    if (err) {
                        return next(err);
                    };
                    
                    var data = {};
                    
                    if (!!result) {
                        data.id = result._id;
                        data.lastUpdated = result.lastUpdated;
                    };
                    
                    res.send(200, data);
                    return next();
                });
            })
            .catch(function(err) {
                return next(err);
            });
    };
    
    var getBookmarks = function(req, res, next) {
        if (!req.params.secretHash) {
            return next(new restify.MissingParameterError("No secret hash provided."));
        };
        
        db.bookmarks().findOne(
            { _id: mongojs.ObjectId(req.params.id),
              secretHash: req.params.secretHash }, 
            function(err, result) {
                if (err) {
                    return next(err);
                };
                
                var data = {};
                
                if (result) {
                    data.bookmarks = result.bookmarks;
                    data.lastUpdated = result.lastUpdated;
                };
                
                res.send(200, data);
                return next();
            }
        );
        
        db.bookmarks().update(
            { _id: mongojs.ObjectId( req.params.id) }, 
            { $set: { lastAccessed: new Date() } },
            function(err, result) {
                if (err) {
                    return next(err);
                };
                
                return next();
            }
        );
    };
    
    var getLastUpdated = function(req, res, next) {
        if (!req.params.secretHash) {
            return next(new restify.MissingParameterError("No secret hash provided."));
        };
        
        db.bookmarks().findOne( 
            { _id: mongojs.ObjectId(req.params.id),
              secretHash: req.params.secretHash }, 
            function(err, result) {
                if (err) {
                    return next(err);
                };
                
                var data = {};
                
                if (result) {
                    data.lastUpdated = result.lastUpdated;
                };
                
                res.send(200, data);
                return next();
            }
        );
    };
    
    var updateBookmarks = function(req, res, next) {
        if (!req.params.secretHash) {
            return next(new restify.MissingParameterError("No secret hash provided."));
        };
        
        var bookmark = {};
        bookmark.bookmarks = req.params.bookmarks;
        bookmark.secretHash = req.params.secretHash;
        bookmark.lastAccessed = new Date();
        bookmark.lastUpdated = new Date();
        
        db.bookmarks().update(
            { _id: mongojs.ObjectId(req.params.id),
              secretHash: req.params.secretHash }, 
            { $set: bookmark },
            function(err, result) {
                if (err) {
                    return next(err);
                };
                
                var data = {};
                
                if (result.n > 0) {
                    data.lastUpdated = bookmark.lastUpdated;
                };                
                
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