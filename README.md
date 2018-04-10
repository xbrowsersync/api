# xBrowserSync: API [![Build Status](https://travis-ci.org/xBrowserSync/API.svg?branch=v1.1.0)](https://travis-ci.org/xBrowserSync/API) [![Dependencies](https://david-dm.org/xBrowserSync/API/status.svg)](https://david-dm.org/xBrowserSync/API) [![Dev Dependencies](https://david-dm.org/xBrowserSync/API/dev-status.svg)](https://david-dm.org/xBrowserSync/API?type=dev)

xBrowserSync is a free tool for syncing browser data between different browsers and devices, built for privacy and anonymity. For full details, see [www.xbrowsersync.org](https://www.xbrowsersync.org/).

This repository contains the source code for the REST service API that client applications communicate with. If you'd like to run your own xBrowserSync service on your [Node.js](https://nodejs.org/) web server, follow the installation steps below.

Once configured, you can begin syncing your browser data to your xBrowserSync service, and if you're feeling generous, [allow others to sync their data to your service](https://www.xbrowsersync.org/#getinvolved) also!

# Prerequisites

- [Node.js](https://nodejs.org/) (8.0.0 or later)
- [mongoDB](https://www.mongodb.com/)

# Upgrading from an earlier version

If you are curently running v1.0.3 or earlier, you will need to export existing syncs and delete the xBrowserSync database (due to case changes in db object names).

To export existing syncs, run the following command:

  ```
  mongoexport --db xBrowserSync -c bookmarks --out /path/to/export/file
  ```

Then to delete the database, run the following commands in the mongo shell:

  ```
  use xBrowserSync
  db.dropAllUsers()
  db.dropDatabase()
  ```

Once you've upgraded and completed the installation steps below, you can import the syncs by running the following command:

  ```
  mongoimport --db xbrowsersync -c bookmarks --file /path/to/export/file
  ```

# Installation

## 1. Install and build xBrowserSync API package

CD into the source directory and install dependencies:

    $ npm install

## 2. Configure mongoDB database

  1. Run the following commands in the mongo shell:
  
      (Replace `[password]` with a cleartext password of your choice)

      ```
      use xbrowsersync
      db.createUser({ user: "xbrowsersyncdb", pwd: "[password]", roles: ["readWrite"] })
      db.newsynclogs.createIndex( { "expiresAt": 1 }, { expireAfterSeconds: 0 } )
      db.newsynclogs.createIndex({ "ipAddress": 1 })
      ```

  2. Add the following environment variables to hold xBrowserSync DB account username and password:

      - `XBROWSERSYNC_DB_USER`
      - `XBROWSERSYNC_DB_PWD`

      On Windows, open a Command Prompt and type (replacing `[password]` with the password entered in the mongo shell):
  
      ```
      setx XBROWSERSYNC_DB_USER "xbrowsersyncdb"
      setx XBROWSERSYNC_DB_PWD "[password]"
      ```
  
      On Ubuntu/Debian Linux, open a terminal emulator and type:
      
      ```
      $ pico ~/.profile
      ```
      
      Add the lines (replacing `[password]` with the password entered in the mongo shell):
      
      ```
      export XBROWSERSYNC_DB_USER=xbrowsersyncdb
      export XBROWSERSYNC_DB_PWD=[password]
      ```
      
      Save and exit, then log out and back in again.

  #### If exposing your service to the public it is recommended you also perform the following steps:
  
  3. Add a TTL index on `bookmarks.lastAccessed` to delete syncs that have not been accessed for 3 weeks:
   
      ```
      use xbrowsersync
      db.bookmarks.createIndex( { "lastAccessed": 1 }, { expireAfterSeconds: 21*86400 } )
      ```

## 3. Edit xBrowserSync service configuration

Open `src/config.json` in a text editor and update the following variables with your desired values:

Config Setting | Description | Default Value
-------------- | ----------- | -------------
`allowedOrigins` | Array of origins permitted to access the service. Each origin can be a `String` or a `RegExp`. For example `[ 'http://example1.com', /\.example2\.com$/ ]` will accept any request from `http://example1.com` or from a subdomain of `example2.com`. If the array is empty, all origins are permitted | `[]` (All origins permitted)
`dailyNewSyncsLimit` | The maximum number of new syncs that a single IP address can create per day. If this setting is enabled, logs are created in newsynclogs collection to track IP addresses (cleared the following day). Set as `0` to disable. | `3`
`db.connTimeout` | The connection timeout period to use for mongoDB. Using a high value helps prevent dropped connections in a hosted environment. | `30000` (30 secs)
`db.host` | The mongoDB server address to connect to, either a hostname, IP address, or UNIX domain socket. | `127.0.0.1`
`db.name` | Name of the mongoDB database to use. | `xbrowsersync`
`db.username` | Username of the account used to access mongoDB. Set as empty string to use environment variable `XBROWSERSYNC_DB_USER`. | (Empty string, defers to environment variable)
`db.password` | Password of the account used to access mongoDB. Set as empty string to use environment variable `XBROWSERSYNC_DB_PWD`. | (Empty string, defers to environment variable)
`log.enabled` | If set to true, [Bunyan](https://github.com/trentm/node-bunyan) will be used to capture minimal logging (service start/stop, new sync created, errors) to file. | `true`
`log.level` | Bunyan log level to capture: `trace`, `debug`, `info`, `warn`, `error`, `fatal`. | `info`
`log.name` | Name of the bunyan logger. | `xBrowserSync_api`
`log.path` | Path to the file to log messages to (ensure node has permission to write to this location). Will be created automatically if path does not exist. | `/var/log/xBrowserSync_api.log`
`maxSyncs` | The maximum number of unique syncs to be stored on the service, once this limit is reached no more new syncs are permitted. Esers with an existing sync ID are able to get and update their sync data as normal. This value multiplied by the maxSyncSize will determine the maximum amount of disk space used by the xBrowserSync service. Set as `0` to disable. | `5242`
`maxSyncSize` | The maximum sync size in bytes. Note this is not equivalent to the size/amount of bookmarks as data is compressed and encrypted client-side before being sent to the service. | `512000` (500kb)
`server.behindProxy` | Set to `true` if service is behind a proxy, client IP address will be set from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) header. Important: Do not set to `true` unless a proxy is present otherwise client IP address can easily be spoofed by malicious users. | `false`
`server.host` | Host name or IP address to use for Node.js server for accepting incoming connections. | `127.0.0.1`
`server.hpkp.enabled` | Enables [HTTP Public Key Pinning](https://developer.mozilla.org/en-US/docs/Web/HTTP/Public_Key_Pinning) to decrease the risk of [MITM](https://developer.mozilla.org/en-US/docs/Glossary/MITM) attacks with forged certificates. Note: HTTPS must be enabled (see below) when HPKP is enabled. | `false`
`server.hpkp.maxAge` | The amount of time (in seconds) that the browser should remember that this site is only to be accessed using one of the defined keys. | `5184000` (60 days)
`server.hpkp.sha256s` | Array of Base64 encoded Subject Public Key Information (SPKI) fingerprints. A minimum of two public key hashes are required when HPKP is enabled. | `[]` (No keys set)
`server.https.certPath` | Path to a valid SSL certificate. Required when HTTPS is enabled. | (Empty string, no path set)
`server.https.enabled` | If enabled, the service is started using HTTPS. | `false`
`server.https.keyPath` | Path to the SSL certificate's private key. Required when HTTPS is enabled. | (Empty string, no path set)
`server.port` | Port to use for Node.js server for accepting incoming connections. | `8080`
`status.allowNewSyncs` | Determines whether users will be allowed to create new syncs on this server. Note: if this setting is set to false, users who have already synced to this service and have a sync ID will still able to get and update their syncs. | `true`
`status.message` | This message will be displayed in the service status panel of the client app when using this xBrowserSync service. Ideally the message should be 130 characters or less. | (Empty string, no message set)
`status.online` | If set to true no clients will be able to connect to this service. | `true`
`throttle.maxRequests` | Max number of connections during `throttle.timeWindow` milliseconds before sending a 429 response. Set as `0` to disable. | `1000`
`throttle.timeWindow` | Amount of time (in milliseconds) before throttle counter is reset. | `300000` (5 mins)
`version` | Current version for the API routes. | `1.1.0`


## 4. (Re)build api

If you've made configuration changes, be sure to run a fresh build:

    $ npm run build

## 5. Run xBrowserSync service

    $ node dist/api.js

# VSCode

If you're using [VSCode](https://code.visualstudio.com/), there are three launch configurations:

  1. Debug API: Will compile and debug the main API service.
  2. Debug docs: Will launch API home page in chrome and attach to debugger for debugging docs issues. 
  3. Run tests: Will debug all tests in `test` folder. 

# Issues

If you've found a bug or wish to request a new feature, please submit it [here](https://github.com/xBrowserSync/API/issues/).
