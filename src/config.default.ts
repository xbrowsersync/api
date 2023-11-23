export default {
  version: '1.1.13',
  allowedOrigins: [],
  dailyNewSyncsLimit: +(process.env.XBSAPI_DAILYNEWSYNCSLIMIT ??= '3'),
  db: {
    type: (process.env.XBSAPI_DB_TYPE ??= 'mysql'),
    host: (process.env.XBSAPI_DB_HOST ??= '127.0.0.1'),
    name: (process.env.XBSAPI_DB_NAME ??= 'xbrowsersync'),
    port: +(process.env.XBSAPI_DB_PORT ??= '3306'),
    username: (process.env.XBSAPI_DB_USERNAME ??= ''),
    password: (process.env.XBSAPI_DB_PASSWORD ??= ''),
  },
  location: (process.env.XBSAPI_LOCATION ??= ''),
  log: {
    file: {
      enabled: !!process.env.XBSAPI_LOG_FILE_PATH,
      level: (process.env.XBSAPI_LOG_FILE_LEVEL ??= 'error'),
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
    behindProxy: false,
    host: '0.0.0.0',
    https: {
      certPath: '',
      enabled: false,
      keyPath: '',
    },
    port: 8080,
    relativePath: '/',
  },
  status: {
    allowNewSyncs: true,
    message: (process.env.XBSAPI_STATUS_MESSAGE ??= ''),
    online: !!process.env.XBSAPI_STATUS_ONLINE,
  },
  tests: {
    db: 'xbrowsersynctest',
    port: 8081,
  },
  throttle: {
    maxRequests: 1000,
    timeWindow: 300000,
  },
};
