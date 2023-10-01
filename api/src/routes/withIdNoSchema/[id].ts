import { ApiRoute } from '../../lib/types';

export const GET: ApiRoute = (req) => {
  const id = (req.params as any).id as string;
  return { id };
};
