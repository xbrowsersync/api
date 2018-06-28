import Server from './core/server';

// Entry point into server
const server = new Server();
server.init().then(server.start);