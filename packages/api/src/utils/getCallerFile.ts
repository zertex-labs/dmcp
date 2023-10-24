/**
 * Gets the file path of the caller
 * @param err Error to get the caller file from (doesn't matter what the message is)
 * @returns The file path of the caller
 *
 *
 * @example
 * // someFolder/file.ts
 * import { getCallerFile } from './getCallerFile'
 *
 * export function someFunction() {
 *  console.log(getCallerFile(new Error('getCallerFile'))) // someFolder/file.ts
 * }
 */
export function getCallerFile(err: Error) {
  Error.prepareStackTrace = (_, stack) => stack
  const stack = err.stack as any
  Error.prepareStackTrace = undefined
  return stack[1].getFileName()
}
