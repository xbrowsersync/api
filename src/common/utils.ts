import * as Config from '../config';
import { ServiceNotAvailableException } from '../exception';

// Throws an error if the service status is set to offline in config
export const checkServiceAvailability = (): void => {
  if (!Config.get().status.online) {
    throw new ServiceNotAvailableException();
  }
};
