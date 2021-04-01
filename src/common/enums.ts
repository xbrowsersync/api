export enum LogLevel {
  Error,
  Info,
}

export enum ServiceStatus {
  online = 1,
  offline = 2,
  noNewSyncs = 3,
}

export enum Verb {
  delete = 'delete',
  get = 'get',
  options = 'options',
  patch = 'patch',
  post = 'post',
  put = 'put',
}
