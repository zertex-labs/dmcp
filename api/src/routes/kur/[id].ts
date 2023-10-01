import { ApiRoutes } from '../../lib/types';

export const routes: ApiRoutes = {
  GET: {
    handler: async () => {
      return { hello: 'kur' };
    }
  }
};
