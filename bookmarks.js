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
    
    var countBookmarks = function(callback) {
        /*db.bookmarks().count(
            { "secretCheck" : "e9fe51f94eadabf54dbf2fbbd57188b9abee436e" }, 
            function(err, result) {
                return callback(result);
            });*/
        
        db.bookmarks().stats(
            function(err, result) {
                return callback(result);
            });
    };
    
    var createBookmarks = function(req, res, next) {
        if (req.params.bookmarks === undefined) {
            return next(new restify.MissingParameterError("Missing 'bookmarks' parameter."));
        };
        
        if (!req.params.secrethash) {
            return next(new restify.MissingParameterError("Missing 'secrethash' parameter."));
        };
        
        var bookmark = {};
        bookmark.bookmarks = req.params.bookmarks;
        bookmark.secrethash = req.params.secrethash;
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
    };
    
    var getBookmarks = function(req, res, next) {
        if (!req.params.secrethash) {
            return next(new restify.MissingParameterError("Missing 'secrethash' parameter."));
        };
        
        db.bookmarks().findOne(
            { _id: mongojs.ObjectId(req.params.id),
              secrethash: req.params.secrethash }, 
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
        if (!req.params.secrethash) {
            return next(new restify.MissingParameterError("Missing 'secrethash' parameter."));
        };
        
        db.bookmarks().findOne( 
            { _id: mongojs.ObjectId(req.params.id),
              secrethash: req.params.secrethash }, 
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
        if (!req.params.secrethash) {
            return next(new restify.MissingParameterError("Missing 'secrethash' parameter."));
        };
        
        var bookmark = {};
        bookmark.bookmarks = req.params.bookmarks;
        bookmark.secrethash = req.params.secrethash;
        bookmark.lastAccessed = new Date();
        bookmark.lastUpdated = new Date();
        
        db.bookmarks().update(
            { _id: mongojs.ObjectId(req.params.id),
              secrethash: req.params.secrethash }, 
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
        count: countBookmarks,
        createBookmarks: createBookmarks,
        getBookmarks: getBookmarks,
        getLastUpdated: getLastUpdated,
        updateBookmarks: updateBookmarks
    };
};

module.exports = xBrowserSync.API.Bookmarks();