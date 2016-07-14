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
        // Determines whether users will be allowed to create new syncs on this server. Note: 
        // if this setting is set to false, users who have already synced to this service and have 
        // a sync ID will still able to get and update their syncs. Default is true.
        allowNewSyncs: true,
        
        // Order of methods to use when determining client ip address to enforce daily new sync limit. 
        // When the service is running behind a reverse proxy HTTP headers (xClientIp/xForwardedFor) can 
        // be used, otherwise remoteAddress should be used first to protect against IP spoofing.
        clientIpMethodOrder: [
            global.clientIpMethods.xClientIp,
            global.clientIpMethods.xForwardedFor,
            global.clientIpMethods.remoteAddress
        ],
        
        // Maximum number of new syncs that can be created per day by a single IP address in order to 
        // prevent new sync flooding. Default is 3.
        dailyNewSyncLimit: 3,
        
        // Mongo db settings
        db: {
            // The mongo db server address to connect to, either a hostname, IP address, or UNIX domain 
            // socket.
            host: 'localhost',
            
            // Name of the mongo database to use.
            name: 'xBrowserSync',        
            
            // Username to authenticate with when connecting to mongo db. Default is 
            // process.env.XBROWSERSYNC_DB_USER which uses the local environment variable XBROWSERSYNC_DB_USER.
            username: process.env.XBROWSERSYNC_DB_USER,
            
            // Password to authenticate with when connecting to mongo db. Default is 
            // process.env.XBROWSERSYNC_DB_PWD which uses the local environment variable XBROWSERSYNC_DB_PWD.
            password: process.env.XBROWSERSYNC_DB_PWD
        },
            
        // Server logging settings
        log: {
            // Determines whether logging is enabled. Default is true.
            enabled: true,
            
            // Bunyan log level to capture: trace, debug, info, warn, error, fatal. Default is info.
            level: 'info',
            
            // Name of the bunyan logger. Default is xBrowserSync_api.
            name: 'xBrowserSync_api',
            
            // Path to the file to log to. Default is /var/log/xBrowserSync_api.log.
            path: '/var/log/xBrowserSync_api.log'
        },
        
        // The maximum number of syncs to be held on the service, once this limit is reached no more new 
        // syncs are permitted though users with an existing sync ID are still allowed to get and update 
        // their sync data. Default is 5242. This value multiplied by the maxSyncSize will determine the 
        // maximum amount of disk space used by the xBrowserSync service. Using the default values, the 
        // maximum amount of disk space used will be 1GB.
        maxSyncs: 5242,
        
        // The maximum sync size in bytes. Default is 204800 (200kB).
        maxSyncSize: 204800,

        // Google reCAPTCHA settings
        recaptcha: {
            // Determines whether new syncs are required to pass recatcha. Default is false.
            enabled: false,

            // reCAPTCHA site key supplied by Google.
            siteKey: '',

            // reCAPTCHA secret key supplied by Google.
            secretKey: ''
        },
        
        // Node.js server settings
        server: {
            // Host name or IP address to use for Node.js server for accepting incoming connections.
            host: '127.0.0.1',
            
            // Port to use for Node.js server for accepting incoming connections.
            port: '8080'
        },
        
        // Status of xBrowserSync server, if set to offline as per commented out value, no clients will 
        // be able to sync to this service. Default is global.serviceStatuses.online.
        status: global.serviceStatuses.online,
        //status: global.serviceStatuses.offline,
        
        // This message will be displayed in the service status panel of the client app when using this 
        // xBrowserSync service. Ideally the message should be 130 characters or less. Use this message 
        // to inform users of interruptions to the service or if no new syncs are being accepted, as per 
        // the commented out example message below.   
	    statusMessage: '',
	    //statusMessage: 'This xBrowserSync service is not accepting new syncs. You may sync to this service only if you have already created a sync here.',,
            
        // Throttling settings to use for Node.js server to prevent request flooding.
        throttle: {
            // Maximum possible number of requests per second. Default is 50.
            burst: 50,
            
            // Average rate of requests per second. Default is 100.
            rate: 100
        },
        
        // Current version for the API routes
        version: '1.0.0'
    };
};

module.exports = xBrowserSync.API.Config();
