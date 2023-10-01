import path from 'path';
import fs from 'fs';

import { FastifyInstance } from 'fastify';
import { loadRoute } from './load';
import { filePathToRoute } from './filePathToRoute';

export type ScanFoldersOptions = {
  app: FastifyInstance;
  dir: {
    path: string;
    current: string;
  };
};

export const scanFolders = async ({ app, dir }: ScanFoldersOptions) => {
  const combined = path.join(dir.path, dir.current);
  const stat = fs.statSync(combined);

  if (stat.isDirectory()) {
    if (path.basename(dir.current).startsWith('_')) return;
    const files = fs.readdirSync(combined);
    for (const file of files) {
      await scanFolders({
        app,
        dir: {
          path: dir.path,
          current: path.join(dir.current, file)
        }
      });
    }
  } else {
    await loadRoute({
      app,
      url: filePathToRoute(dir.current),
      fullPath: combined
    });
  }
};
