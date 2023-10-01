import path from 'path';

export const getDirPath = (dirPath: string): string => {
  if (path.isAbsolute(dirPath)) return dirPath;

  const argv = process.argv[1];
  if (!argv) return dirPath;

  if (path.isAbsolute(argv)) {
    return path.join(argv, '..', dirPath);
  }
  return path.join(process.cwd(), argv, '..', dirPath);
};

export default getDirPath;
