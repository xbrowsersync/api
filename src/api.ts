// tslint:disable:no-unused-expression

import Server from './server';

// Entry point into server
export default (() => {
  const server = new Server();
  server.init().then(server.start);
})();