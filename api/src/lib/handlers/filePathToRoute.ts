import path from 'path';

import { handleParameters } from './handleParameters';

export const filePathToRoute = (filePath: string) => {
  if (filePath.length === 0) return '/';

  let out = `/${filePath}`
    .split(path.sep)
    .map((part) => handleParameters(part))
    .join('/');

  if (out.endsWith('index')) out = out.replace('index', '');
  if (out.endsWith('/')) out = out.slice(0, -1);
  if (out.length === 0) return '/';

  return out.replace('//', '/');
};
