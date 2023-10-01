import { FastifyInstance } from 'fastify';
import fs from 'fs';

import getDirPath from '../handlers/getDirPath';
import { scanFolders } from '../handlers/scanFolders';

export class FileRoutingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileBasedPluginError';
  }
}
export type FileRoutingPluginOptions = {
  dir: string;
  debug?: boolean;
};

export type FileRoutingPlugin = {};

export const fileRouting = async (
  app: FastifyInstance,
  options: FileRoutingPluginOptions,
  next: any
): Promise<any> => {
  let { dir, debug = true, } = options;

  if (!dir) {
    const msg = 'No directory specified for file based routing';
    app.log.error(msg);
    return next(new FileRoutingError(msg));
  }

  if (typeof dir != 'string') {
    const msg = 'Directory must be a string';
    app.log.error(msg);
    return next(new FileRoutingError(msg));
  }

  const dirPath = getDirPath(dir);
  if (!fs.existsSync(dirPath)) {
    const msg = `Directory does not exist: ${dirPath}`;
    app.log.error(msg);
    return next(new FileRoutingError(msg));
  }

  if (!fs.statSync(dirPath).isDirectory()) {
    const msg = `Path is not a directory: ${dirPath}`;
    app.log.error(msg);
    return next(new FileRoutingError(msg));
  }

  try {
    await scanFolders({
      app,
      dir: {
        path: dirPath,
        current: ''
      }
    });
  } catch (e) {
    debug && app.log.error(e);
    if (e instanceof FileRoutingError) return next(e);
  }

  return next();
};

export default fileRouting;
