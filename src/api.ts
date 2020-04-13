import Server from './server';

// Entry point into server
const server = new Server();
server.init().then(server.start);