import { createApplication, startService } from './server';

// Entry point into server
export default (async () => {
  const app = await createApplication();
  await startService(app);
})();
