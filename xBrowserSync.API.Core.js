"use strict";

// Class name:	xBrowserSync.API.Core 
// Description:	Defines core functions used by the API.

module.exports = function() {    
    // Requires
    var restify = require("restify");
    var fs = require("fs");
    var mongojs = require("mongojs");
    var status = require("./xBrowserSync.API.Status.js");
    var bookmarks = require("./xBrowserSync.API.Bookmarks.js");
    
    var globals = {
        Environments: {
            Dev: { 
                IPAddress: "127.0.0.1",
                Port:  "8080"
            },
            Prod: {
                DBUsername: "xBrowserSync",
                DBPassword: "V;|m|!WKo1J7&6O"
            }
        },
        APIName: "xBrowserSync",
        DBName: "xBrowserSync",
        IPAddress: null,
        Port: null,
        URLPath: "/",
        DB: null,
        Collections: {
            Bookmarks: null
        },
        MaxPayloadSize: 5242880
    };
    
    var init = function() {
        if (process.env.NODE_ENV === "development") {
            globals.IPAddress = globals.Environments.Dev.IPAddress;
            globals.Port = globals.Environments.Dev.Port;
        }
        else {
            globals.IPAddress = process.env.OPENSHIFT_NODEJS_IP;
            globals.Port = process.env.OPENSHIFT_NODEJS_PORT;
        };
        
        globals.Server = restify.createServer({
            name: globals.APIName
        });
        
        globals.Server.listen(globals.Port, globals.IPAddress, function() {
            console.log("%s: %s started on %s:%d ...",
                Date(Date.now()), globals.APIName, globals.IPAddress, globals.Port);
        });
        
        globals.Server.use(restify.CORS());
        globals.Server.use(
            function crossOrigin(req,res,next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                return next();
            }
        );
        
        globals.Server.use(restify.queryParser());
        globals.Server.use(restify.bodyParser({
            maxBodySize: globals.MaxPayloadSize
        }));
        globals.Server.use(restify.throttle({
            rate: 100,
            burst: 50,
            ip: true
        }));
        
        connectToDb();
        
        createRoutes();
    };
    
    function connectToDb() {        
        if (process.env.NODE_ENV != "development") {
            globals.DB = mongojs(
                globals.Environments.Prod.DBUsername + ":" +
                globals.Environments.Prod.DBPassword + "@" +
                process.env.OPENSHIFT_MONGODB_DB_HOST + "/" +
                globals.DBName);
        }
        else {
            globals.DB = mongojs(globals.DBName);
        };
        
        globals.Collections.Bookmarks = globals.DB.collection("bookmarks");
    };
    
    var createRoutes = function() {
        globals.Server.get("/", function indexHTML(req, res, next) {
            fs.readFile("index.html", function (err, data) {
                if (err) {
                    next(err);
                    return;
                }
        
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(data);
                next();
            });
        });
        
        // Status
        globals.Server.get({ path : globals.URLPath + "status", version: "0.0.1" }, status.GetStatus);
        
        // Bookmarks
        globals.Server.post({ path : globals.URLPath + "bookmarks", version: "0.0.1" }, bookmarks.CreateBookmarks);
        globals.Server.get({ path : globals.URLPath + "bookmarks/:id/:secretCheck", version : "0.0.1" }, bookmarks.GetBookmarks);
        globals.Server.post({ path : globals.URLPath + "bookmarks/:id", version : "0.0.1" }, bookmarks.UpdateBookmarks);
        globals.Server.get({ path : globals.URLPath + "bookmarks/:id/lastUpdated/:secretCheck", version : "0.0.1" }, bookmarks.GetLastUpdated);
    };
    
    var terminator = function(sig) {
        if (typeof sig === "string") {
           console.log("%s: Received %s - terminating sample app ...",
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log("%s: Node server stopped.", Date(Date.now()) );
    };

    var setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on("exit", function() { terminator(); });

        // Removed "SIGPIPE" from the list - bugz 852598.
        ["SIGHUP", "SIGINT", "SIGQUIT", "SIGILL", "SIGTRAP", "SIGABRT",
         "SIGBUS", "SIGFPE", "SIGUSR1", "SIGSEGV", "SIGUSR2", "SIGTERM"
        ].forEach(function(element, index, array) {
            process.on(element, function() { terminator(element); });
        });
    };
    
    return {
        Globals: globals,
        Init: init
    }; 
}();
    
// Call init to start the service
module.exports.Init();