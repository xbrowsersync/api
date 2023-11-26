# xBrowserSync

This is a fork of the original xBrowserSync, which support MySQL, PostgreSQL, SQLite3 and provide up to date dependencies, but keep the rest of application equal, so it is a full replacement of original version.  
At the moment, there is no mass migration available. Every user must migrate own bookmarks himself.

## API service

[![Build Status](https://travis-ci.org/xbrowsersync/api.svg)](https://travis-ci.org/xbrowsersync/api) [![Coverage Status](https://coveralls.io/repos/github/xbrowsersync/api/badge.svg?branch=master)](https://coveralls.io/github/xbrowsersync/api?branch=master) ![Dependencies](https://img.shields.io/depfu/xbrowsersync/api) [![Known Vulnerabilities](https://snyk.io/test/github/xbrowsersync/api/badge.svg?targetFile=package.json)](https://snyk.io/test/github/xbrowsersync/api?targetFile=package.json) [![GitHub license](https://img.shields.io/github/license/xbrowsersync/api.svg)](https://github.com/xbrowsersync/api/blob/master/LICENSE.md) [![Liberapay patrons](http://img.shields.io/liberapay/patrons/xbrowsersync.svg?logo=liberapay)](https://liberapay.com/xbrowsersync/donate)

[![GitHub stars](https://img.shields.io/github/stars/xbrowsersync/api.svg?style=social&label=Star)](https://github.com/xbrowsersync/api)
[![GitHub forks](https://img.shields.io/github/forks/xbrowsersync/api.svg?style=social&label=Fork)](https://github.com/xbrowsersync/api/fork)

xBrowserSync is a free tool for syncing browser data between different browsers and devices, built for privacy and anonymity. For full details, see [www.xbrowsersync.org](https://www.xbrowsersync.org/).

This repository contains the source code for the REST service API that client applications communicate with. If you'd like to run your own xBrowserSync service on your [Node.js](https://nodejs.org/) web server, follow the installation steps below.

Once configured, you can begin syncing your browser data to your xBrowserSync service, and if you're feeling generous, [allow others to sync their data to your service](https://www.xbrowsersync.org/#getinvolved) also!

## API documentation

The available API methods are documented on the home page of each xBrowserSync service, respective of the version that service is running. For example, you can view the API documentation for the official xBrowserSync service at [api.xbrowsersync.org](https://api.xbrowsersync.org/).

## Running with Docker

The easiest way to get up and running is by using [Docker](https://www.docker.com/) to run the xBrowserSync API as a container. Docker is a popular container management and imaging platform that allows you to quickly work with containers on Linux and Windows.

Once you have installed Docker you can use the [xBrowserSync API Docker image](https://hub.docker.com/r/swarnat/xbrowsersync-api) to get a production-ready xBrowserSync service up and running with minimal effort (view the [README](https://github.com/xbrowsersync/api-docker/blob/master/README.md) for more information).

All configurations can be done over [examples/xbrowsersync.env](environment variables) or as bind mount of settings.json.
Also there is a [examples/docker-compose.yaml](docker-compose.yaml) file for you to quick start the service.

## Manual installation

Whilst running in a Docker container is the recommended way to run your xBrowserSync service, you can self-host xBrowserSync instead by performing a manual installation on your own server by installing the two dependencies listed as prerequisites and following the six easy steps below:

### Prerequisites

- [Node.js](https://nodejs.org/)
- MySQL, PostgreSQL database server

### 1. Clone the xBrowserSync API source repo

    $ git clone https://github.com/swarnat/xbrowsersync-api.git

### 2. Install and build xBrowserSync API package

  (Use the `unsafe-perm` flag if you get any permissions issues whilst trying to install):

    $ npm install --unsafe-perm

### 3. Configure SQL databases

#### SQLite

The sqlite3 database is created within folder **/usr/src/app/data** and called **xbrowsersync.sqlite3**.  
For persistence of bookmarks mount a volume into that path, like shown in [examples//docker-compose.yaml](examples//docker-compose.yaml)

#### MySQL, PostgreSQL

  1. Create a database and User
  
  2. Add the following environment variables to hold xBrowserSync DB account username and password:

      - `XBSAPI_DB_HOST`
      - `XBSAPI_DB_NAME`
      - `XBSAPI_DB_USERNAME`
      - `XBSAPI_DB_PASSWORD`

      On Windows, open a Command Prompt and type (replacing `[password]` with the password entered in the mongo shell):
  
      ```
      setx XBSAPI_DB_USERNAME "xbrowsersyncdb"
      setx XBSAPI_DB_PASSWORD "[password]"
      ```
  
      On Ubuntu/Debian Linux, open a terminal emulator and type:
      
      ```
      $ pico ~/.profile
      ```
      
      Add the lines (replacing `[password]` with the password entered in the mongo shell):
      
      ```
      export XBSAPI_DB_USERNAME=xbrowsersyncdb
      export XBSAPI_DB_PASSWORD=[password]
      ```
      
      Save and exit, then log out and back in again.

### 4. Modify configuration settings

The file `config/settings.default.json` contains all of the default configuration settings. User configuration values should be stored in `config/settings.json` and will override the defaults. Should you wish to change any of the configuration settings, copy `settings.default.json` and rename the copy to `settings.json` before changing any values as required. Be sure to remove any settings that have not been changed so that any amendments to the default values in future versions are picked up. For example, a basic user configuration to modify the service status message could look like:

As alternative you can also set the corresponding environment variables, you found within [examples/xbrowsersync.env](examples/xbrowsersync.env)

```
{
  "status": {
    "message": "Welcome to my xBrowserSync service!"
  }
}
```

Any changes to the user configuration will require the service to be restarted before being picked up. The available configuration settings are:

Config Setting | Description | Default Value | Environment Variable
-------------- | ----------- | ------------- | --------------------
`allowedOrigins` | Array of origins permitted to access the service. Each origin can be a `String` or a `RegExp`. For example `[ 'http://example1.com', /\.example2\.com$/ ]` will accept any request from `http://example1.com` or from a subdomain of `example2.com`. If the array is empty, all origins are permitted | `[]` (All origins permitted) | XBSAPI_ALLOWEDORIGINS<br/>*comma separated domainlist*
`dailyNewSyncsLimit` | The maximum number of new syncs that a user can create per day - helps to prevent abuse of the service. If this setting is enabled, IP addresses are added to newsynclogs collection to track usage which is cleared down each day. Set as `0` to disable (allows users to create as many syncs as they want). | `3` | XBSAPI_DAILYNEWSYNCSLIMIT
`db.type` | Define the database type you want to use. One of `mysql`, `postgres`, `sqlite` | `sqlite` (30 secs) | XBSAPI_DB_TYPE
`db.connTimeout` | The connection timeout period to use for MongoDB. Using a high value helps prevent dropped connections in a hosted environment. | `30000` (30 secs)
`db.host` | The MongoDB server address to connect to, either a hostname, IP address, or UNIX domain socket. | `127.0.0.1` | XBSAPI_DB_HOST
`db.name` | Name of the MongoDB database to use. | `xbrowsersync` | XBSAPI_DB_NAME
`db.username` | Username of the account used to access MongoDB. Set as empty string to use environment variable `XBROWSERSYNC_DB_USER`. | (Empty string, defers to environment variable) | XBSAPI_DB_USERNAME
`db.password` | Password of the account used to access MongoDB. Set as empty string to use environment variable `XBROWSERSYNC_DB_PWD`. | (Empty string, defers to environment variable) | XBSAPI_DB_PASSWORD
`db.port` | The port to use to connect to database server. | `3306` | XBSAPI_DB_PORT
`db.filepath` | When SQLite is used, this define the path to database. | `data` | XBSAPI_DB_FILEPATH
`location` | The geographic location of the service, determined by an ISO 3166-1-alpha-2 code. Helps users determine if the service is geographically suitable for them when exposing the service to the public. | `gb` | XBSAPI_LOCATION
`log.file.enabled` | If set to true, [Bunyan](https://github.com/trentm/node-bunyan) will be used to capture minimal logging (service start/stop, new sync created, errors) to file. Logged messages are output to `log.file.path` and the log file is rotated automatically each period set by `log.file.rotationPeriod`, resulting in files "`log.file.path`.0", "`log.file.path`.1", etc. | `true`
`log.file.level` | Bunyan log level to capture: `trace`, `debug`, `info`, `warn`, `error`, `fatal`. | `info` | XBSAPI_LOG_FILE_LEVEL
`log.file.path` | File path to log messages to (ensure the account node is running as has permission to write to this location). | `/var/log/xBrowserSync/api.log` | XBSAPI_LOG_FILE_PATH
`log.file.rotatedFilesToKeep` | Maximum number of rotated log files to retain. | `5` | XBSAPI_LOG_FILE_KEEPROTATION
`log.file.rotationPeriod` | 	The period at which to rotate log files. This is a string of the format "$number$scope" where "$scope" is one of "ms" (milliseconds -- only useful for testing), "h" (hours), "d" (days), "w" (weeks), "m" (months), "y" (years). Or one of the following names can be used "hourly" (means 1h), "daily" (1d), "weekly" (1w), "monthly" (1m), "yearly" (1y). Rotation is done at the start of the scope: top of the hour (h), midnight (d), start of Sunday (w), start of the 1st of the month (m), start of Jan 1st (y). | `1d` | XBSAPI_LOG_FILE_ROTATIONPERIOD
`log.stdout.enabled` | If set to true, [Bunyan](https://github.com/trentm/node-bunyan) will be used to capture minimal logging (service start/stop, new sync created, errors) to stdout. | `true`
`log.stdout.level` | Bunyan log level to capture: `trace`, `debug`, `info`, `warn`, `error`, `fatal`. | `info`
`maxSyncs` | The maximum number of unique syncs to be stored on the service, once this limit is reached no more new syncs are permitted. Users with an existing sync ID are able to get and update their sync data as normal. This value multiplied by the maxSyncSize will determine the maximum amount of disk space used by the xBrowserSync service. Set as `0` to disable. | `5242`
`maxSyncSize` | The maximum sync size in bytes. Note this is not equivalent to the size/amount of bookmarks as data is compressed and encrypted client-side before being sent to the service. | `512000` (500kb)
`server.behindProxy` | Set to `true` if service is behind a proxy, client IP address will be set from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) header. Important: Do not set to `true` unless a proxy is present otherwise client IP address can easily be spoofed by malicious users. | `false`
`server.host` | Host name or IP address to use for Node.js server for accepting incoming connections. | `127.0.0.1`
`server.https.certPath` | Path to a valid SSL certificate. Required when HTTPS is enabled. | (Empty string, no path set)
`server.https.enabled` | If enabled, the service is started using HTTPS. | `false`
`server.https.keyPath` | Path to the SSL certificate's private key. Required when HTTPS is enabled. | (Empty string, no path set)
`server.port` | Port to use for Node.js server for accepting incoming connections. | `8080`
`server.relativePath` | Relative path from the host where the service will be located. Should always begin (and end) with `/`. | `/`
`status.allowNewSyncs` | Determines whether users will be allowed to create new syncs. Note: if this setting is set to false, users who have already synced to this service and have a sync ID will still able to get and update their syncs. | `true`
`status.message` | This message will be displayed in the service status panel of the client app when using this xBrowserSync service. Ideally the message should be 130 characters or less. Supports [markdown](https://guides.github.com/features/mastering-markdown/) formatting. | (Empty string, no message set)
`status.online` | If set to false no clients will be able to connect to this service. | `true`
`tests.db` | Name of the MongoDB database to use for e2e tests. | `xbrowsersynctest`
`tests.port` | Port to use for running tests. | `8081`
`throttle.maxRequests` | Max number of connections during `throttle.timeWindow` milliseconds before sending a 429 response. Set as `0` to disable. | `1000`
`throttle.timeWindow` | Amount of time (in milliseconds) before throttle counter is reset. | `300000` (5 mins)

### 5. Create log folder

Ensure that the path set in the `log.path` config value exists, and that the account node will be running as can write to that location.

### 6. Run xBrowserSync service

    $ node dist/api.js

## Building

If you've made code changes you can run a fresh build with the command:

    $ npm run build

## Testing

The project includes unit, integration and end to end tests.

To run end to end tests, you will need to create the test database first. Run the following commands in the mongo shell:

  (Replace `[dbname]` with your xBrowserSync database name and `[password]` with the xBrowserSync database user account password)

  ```
  use [dbname]test
  db.createUser({ user: "xbrowsersyncdb", pwd: "[password]", roles: ["readWrite"] })
  ```

You can then run the end to end tests by running the following command:

    $ npm run test

## DB Migrations

Because TypeORM works with database migrations, you need to generate them:

```
npm run typeorm:migration:generate -- ./src/migrations/<migrationname>
```

After this, add them to **src/db.ts** within migrations array to add them to compiled result.

## Other Implementations

### Google Cloud

- [sbogomolov/xbrowsersync-gcf](https://github.com/sbogomolov/xbrowsersync-gcf): An implementation of the xBrowserSync API using Google Cloud Functions with Firestore backend.

### Cloudflare Worker

- [txchen/xbrowsersync-cfw](https://github.com/txchen/xbrowsersync-cfw): An implementation of the xBrowserSync API using Cloudflare worker and KV.

## VS Code

If you're using [VS Code](https://code.visualstudio.com/), you have the following launch configurations:

  1. Debug API: Will compile and debug the main API service.
  2. Debug docs: Will launch API home page in chrome and attach to debugger for debugging docs issues. 
  3. Run unit/integration tests: Will debug tests in `*.spec.ts` files in `src` folder.
  4. Run e2e tests: Will debug tests in `test/e2e` folder.

Note: we recommend [VSCodium](https://github.com/VSCodium/vscodium/) for running VSCode without Microsoft's proprietary binaries and telemetry/tracking. 

## Issues and feature requests

Please log Docker-related issues in the [api-docker Issues list](https://github.com/xbrowsersync/api-docker/issues), if you have found an issue with the xBrowserSync API itself or wish to request a new feature, do so in the [api Issues list](https://github.com/xbrowsersync/api/issues/).
