import path from 'node:path'
import type { Color } from 'shared'
import colors from 'colors'
import { getCallerFile } from './getCallerFile'

/**
 * Logs a string to the console
 * @param str String to log
 * @param color Color to log the string in (default: green)
 * @param prefix Prefix to log before the string (default: the file name of the caller)
 */
export function log(str: string, color: Color = 'green', prefix?: string) {
  const actualPrefix = prefix ?? path.basename(getCallerFile(new Error('getCallerFile')))
  console.log(`${colors.gray(actualPrefix)} | ${colors[color](str)}`)
}
