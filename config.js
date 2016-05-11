var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.Config 
 * Description: Stores local environment config info.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.Config = function() {
    'use strict';
    
    var global = require('./global.js');
    
    return {
        // Determines whether users will be allowed to create new syncs on this server. Default is true. Note: if this setting is set to false, users who have already synced to this service and have a sync ID will still able to get and update their syncs.
        allowNewSyncs: true,
        
        //
        dailyNewSyncLimit: 10,
        
        // 
        db: {
            //  
            host: 'localhost',
            
            // 
            name: 'xBrowserSync',        
            
            // 
            username: process.env.XBROWSERSYNC_DB_USER,
            
            // 
            password: process.env.XBROWSERSYNC_DB_PWD
        },
        
        // 
        ipAddress: '127.0.0.1',
        
        // The maximum number of syncs to be held on the service, once this limit is reached no more new syncs are permitted though users with an existing sync ID are still allowed to get and update their sync data. Default is 5242. This value multiplied by the maxSyncSize will determine the maximum amount of disk space used by the xBrowserSync service. Using the default values, the maximum amount of disk space used will be 1GB.
        maxSyncs: 5242,
        
        // The maximum sync size in bytes. Default is 1048576 or 200kB.
        maxSyncSize: 204800,
        
        // 
        port: '8080',
        
        // 
        status: global.serviceStatuses.online,
        
        // This message will be displayed in the service status panel of the client app when using this xBrowserSync service. Ideally the message should be 130 characters or less. Use this message to inform users of interruptions to the service or if no new syncs are being accepted, as per the example message below.   
	    statusMessage: '',
	    //statusMessage: 'This xBrowserSync service is not accepting new syncs. You may sync to this service only if you have already created a sync here.',
        
        // 
        throttle: {
            // 
            burst: 50,
            
            // 
            rate: 100
        }
    };
};

module.exports = xBrowserSync.API.Config();
