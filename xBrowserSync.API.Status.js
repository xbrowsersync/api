"use strict";

// Class name:	xBrowserSync.API.Status 
// Description:	Defines status functions for the API.

module.exports = function() {
    var getStatus = function(req, res, next) {
        var result = {
            status: "Online"
        };
        
        res.send(200, result);
        return next();
    };
    
    return {
        GetStatus: getStatus
    }; 
}();