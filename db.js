var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.DB 
 * Description: Provides database connectivity for the API.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.DB = function() {
    'use strict';
    
    var db, bookmarks;    
    var mongojs = require('mongojs');
    var config = require('./config.js');
    
    var connect = function() {
        db = mongojs(
            config.db.username + ':' +
            config.db.password + '@' +
            config.db.host + '/' +
            config.db.name);
    };
    
    var getBookmarks = function() {
        if (!bookmarks) {
            bookmarks = db.collection('bookmarks');
        }
        
        return bookmarks;
    };
    
    return {
        bookmarks: getBookmarks,
        connect: connect
    };
};

module.exports = xBrowserSync.API.DB();