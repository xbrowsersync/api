import path from 'path';

export default {
  version: '1.2.0',
  allowedOrigins:
    (process.env.XBSAPI_ALLOWEDORIGINS ??= '') != '' ? (process.env.XBSAPI_ALLOWEDORIGINS ??= '').split(',') : [],
  dailyNewSyncsLimit: +(process.env.XBSAPI_DAILYNEWSYNCSLIMIT ??= '3'),
  db: {
    type: (process.env.XBSAPI_DB_TYPE ??= 'sqlite'),
    host: (process.env.XBSAPI_DB_HOST ??= '127.0.0.1'),
    name: (process.env.XBSAPI_DB_NAME ??= 'xbrowsersync'),
    port: +(process.env.XBSAPI_DB_PORT ??= '3306'),
    username: (process.env.XBSAPI_DB_USERNAME ??= ''),
    password: (process.env.XBSAPI_DB_PASSWORD ??= ''),
    filepath: (process.env.XBSAPI_DB_FILEPATH ??= path.resolve(__dirname, 'data') + '/xbrowsersync.sqlite3'),
  },
  location: (process.env.XBSAPI_LOCATION ??= 'DE'),
  log: {
    file: {
      enabled: (process.env.XBSAPI_LOG_FILE_PATH ??= '') != '',
      level: (process.env.XBSAPI_LOG_FILE_LEVEL ??= 'debug'),
      path: (process.env.XBSAPI_LOG_FILE_PATH ??= '/var/log/xBrowserSync/api.log'),
      rotatedFilesToKeep: +(process.env.XBSAPI_LOG_FILE_KEEPROTATION ??= '5'),
      rotationPeriod: (process.env.XBSAPI_LOG_FILE_ROTATIONPERIOD ??= '1d'),
    },
    stdout: {
      enabled: true,
      level: (process.env.XBSAPI_LOG_STDOUT_LEVEL ??= 'info'),
    },
  },
  maxSyncs: +(process.env.XBSAPI_MAXSYNCS ??= '5242'),
  maxSyncSize: +(process.env.XBSAPI_MAXSYNCSIZE ??= '512000'),
  server: {
    behindProxy: (process.env.XBSAPI_SERVER_BEHINDPROXY ??= 'false') == 'true',
    host: '0.0.0.0',
    https: {
      certPath: '',
      enabled: false,
      keyPath: '',
    },
    port: 8080,
    relativePath: (process.env.XBSAPI_SERVER_RELATIVEPATH ??= '/'),
  },
  status: {
    allowNewSyncs: (process.env.XBSAPI_STATUS_ALLOWNEWSYNCS ??= 'true') == 'true',
    message: (process.env.XBSAPI_STATUS_MESSAGE ??= ''),
    online: (process.env.XBSAPI_STATUS_ONLINE ??= 'true') == 'true',
  },
  tests: {
    db: 'xbrowsersynctest',
    port: 8081,
  },
  throttle: {
    maxRequests: +(process.env.XBSAPI_THROTTLE_MAXREQUESTS ??= '1000'),
    timeWindow: +(process.env.XBSAPI_THROTTLE_TIMEWINDOW ??= '300000'),
  },
};
