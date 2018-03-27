# xBrowserSync: API [![Build Status](https://travis-ci.org/xBrowserSync/API.svg?branch=v1.1.0)](https://travis-ci.org/xBrowserSync/API)

xBrowserSync is a free tool for syncing browser data between different browsers and devices, built for privacy and anonymity. For full details, see [www.xbrowsersync.org](https://www.xbrowsersync.org/).

This repository contains the source code for the REST service API that client applications communicate with. If you'd like to run your own xBrowserSync service on your [Node.js](https://nodejs.org/) web server, follow the installation steps below.

Once configured, you can begin syncing your browser data to your xBrowserSync service, and if you're feeling generous, [allow others to sync their data to your service](https://www.xbrowsersync.org/#getinvolved) also!

# Prerequisites

- [Node.js](https://nodejs.org/)
- [mongoDB](https://www.mongodb.com/)

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
  db.createCollection("bookmarks")
  db.createCollection("newsynclogs")
  db.newsynclogs.createIndex({ "ipAddress": 1, "syncCreated": 1 })
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
  
  3. Add a Scheduled Task (Windows) or CRON job (Ubuntu/Linux) to clear stale sync data that has not been accessed in a while. The task should run daily with the following command:
   
    - Windows:
  
      ```
      mongod.exe xbrowsersync -u %XBROWSERSYNC_DB_USER% -p %XBROWSERSYNC_DB_PWD% --eval 'db.bookmarks.remove({ lastAccessed: { $lt: new Date((new Date).setDate((new Date()).getDate() - 14)) } })'
      ```
  
    - Ubuntu/Linux:
  
      ```
      mongo xbrowsersync -u $XBROWSERSYNC_DB_USER -p $XBROWSERSYNC_DB_PWD --eval 'db.bookmarks.remove({ lastAccessed: { $lt: new Date((new Date).setDate((new Date()).getDate() - 14)) } })'
      ```

## 3. Edit xBrowserSync service configuration

Open `src/config.json` in a text editor and update the following variables with your desired values:

- `dailyNewSyncsLimit` The maximum number of new syncs that a single IP address can create per day. If this setting is enabled, logs are created in newsynclogs collection to track IP addresses (not kept for longer than a day). Set as `0` to disable.
- `db.host` The mongoDB server address to connect to, either a hostname, IP address, or UNIX domain socket.
- `db.username` Username of the account used to access mongoDB. Set as empty string to use environment variable `XBROWSERSYNC_DB_USER`.
- `db.password` Password of the account used to access mongoDB. Set as empty string to use environment variable `XBROWSERSYNC_DB_PWD`.
- `log.path` Path to the file to log messages to (ensure node has permission to write to this location).
- `maxSyncs` The maximum number of syncs to be held on the service, once this limit is reached no more new syncs are permitted though users with an existing sync ID are still allowed to get and update their sync data. This value multiplied by the maxSyncSize will determine the maximum amount of disk space used by the xBrowserSync service. Set as `0` to disable.
- `maxSyncSize` The maximum sync size in bytes. Set as `0` to disable (i.e. no max sync size).
- `server.behindProxy` Set to `true` if service is behind a proxy, client IP address will be set from `X-Forwarded-For` header. Important: Do not set to `true` unless a proxy is present otherwise client IP address can easily be spoofed by malicious users.
- `server.cors.whitelist` Array of origins permitted to access the service. Each origin can be a `String` or a `RegExp`. For example `[ 'http://example1.com', /\.example2\.com$/ ]` will accept any request from `http://example1.com` or from a subdomain of `example2.com`. If the array is empty, all origins are permitted. 
- `server.host` Host name or IP address to use for Node.js server for accepting incoming connections.
- `server.port` Port to use for Node.js server for accepting incoming connections.

## 4. (Re)build api

If you've made configuration changes, be sure to run a fresh build:

    $ npm run build

## 6. Run xBrowserSync service

    $ node dist/api.js

# Issues

If you've found a bug or wish to request a new feature, please submit it [here](https://github.com/xBrowserSync/API/issues/).
