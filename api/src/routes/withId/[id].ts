import { ApiRoute, ApiRoutes } from '../../lib/types';

export const GET: ApiRoute<true> = {
  handler: (req) => {
    const id = (req.params as any).id as string;
    return { id };
  },
  additional: {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            minLength: 4,
            maxLength: 64
          }
        },
        required: ['id']
      }
    }
  }
};
