import { Logger, genericMakeLog } from 'shared'

export const systemLogger = new Logger('system.log')

const makeLog = genericMakeLog(systemLogger)
export const log = makeLog()

export function error(err: string | Error, additionalInfo?: string) {
  if (typeof err === 'string') {
    log(`${err}; ${additionalInfo}`, 'error')
  }
  else {
    const log = makeLog(err.name)
    log(`${err.message}; ${additionalInfo}`, 'error')
    if (err.stack) log(err.stack, 'error')
  }
}
