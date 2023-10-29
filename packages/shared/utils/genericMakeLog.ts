import type { LogLevel, Logger, OverwriteColors } from './logger'

export type MadeLog = ReturnType<ReturnType<typeof genericMakeLog>>

export function genericMakeLog(logger: Logger) {
  return <Prefix = string>(prefix?: Prefix, overwriteColors?: OverwriteColors) => {
    if (prefix && typeof prefix !== 'string') throw new Error('Prefix must be a string')

    return (str: string, level?: LogLevel) => {
      logger.log(str, level, {
        prefix: prefix as string,
        overwriteColors,
      })
    }
  }
}
