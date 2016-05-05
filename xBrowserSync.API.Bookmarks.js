"use strict";

// Class name:	xBrowserSync.API.Bookmarks 
// Description:	Defines bookmarks functions for the API.

module.exports = function() {
    // Requires
    var restify = require("restify");
    var mongojs = require("mongojs");
    var core;
    
    var requireCore = function() {
        return require("./xBrowserSync.API.Core.js");
    };
    
    var createBookmarks = function(req, res, next) {
        if (!core) {
            core = requireCore();
        };
        
        if (req.params.bookmarks === undefined) {
            return next(new restify.MissingParameterError("Missing \"bookmarks\" parameter."));
        };
        
        if (!req.params.secretCheck) {
            return next(new restify.MissingParameterError("Missing \"secretCheck\" parameter."));
        };
        
        var bookmark = {};
        bookmark.bookmarks = req.params.bookmarks;
        bookmark.secretCheck = req.params.secretCheck;
        bookmark.lastAccessed = new Date();
        bookmark.lastUpdated = new Date();
        
        core.Globals.Collections.Bookmarks.save(bookmark, function(err, result) {
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
        if (!core) {
            core = requireCore();
        };
        
        if (!req.params.secretCheck) {
            return next(new restify.MissingParameterError("Missing \"secretCheck\" parameter."));
        };
        
        core.Globals.Collections.Bookmarks.findOne(
            { _id: mongojs.ObjectId(req.params.id),
              secretCheck: req.params.secretCheck }, 
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
        
        core.Globals.Collections.Bookmarks.update(
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
        if (!core) {
            core = requireCore();
        };
        
        if (!req.params.secretCheck) {
            return next(new restify.MissingParameterError("Missing \"secretCheck\" parameter."));
        };
        
        core.Globals.Collections.Bookmarks.findOne( 
            { _id: mongojs.ObjectId(req.params.id),
              secretCheck: req.params.secretCheck }, 
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
        if (!core) {
            core = requireCore();
        };
        
        if (!req.params.secretCheck) {
            return next(new restify.MissingParameterError("Missing \"secretCheck\" parameter."));
        };
        
        var bookmark = {};
        bookmark.bookmarks = req.params.bookmarks;
        bookmark.secretCheck = req.params.secretCheck;
        bookmark.lastAccessed = new Date();
        bookmark.lastUpdated = new Date();
        
        core.Globals.Collections.Bookmarks.update(
            { _id: mongojs.ObjectId(req.params.id),
              secretCheck: req.params.secretCheck }, 
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
        CreateBookmarks: createBookmarks,
        GetBookmarks: getBookmarks,
        GetLastUpdated: getLastUpdated,
        UpdateBookmarks: updateBookmarks        
    }; 
}();