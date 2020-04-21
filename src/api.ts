import * as Server from './server';

// Entry point into server
export default (async () => {
  const app = await Server.createApplication();
  await Server.startService(app);
})();