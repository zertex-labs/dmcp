import { Logger, genericMakeLog } from 'shared'
import { pgClient } from '../db'

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
    if (err.stack) log(err.stack.replace('Error: ', ''), 'error')

    // -- Error handling --
    console.log(err.message)
    if (err.message === 'Client has encountered a connection error and is not queryable') {
      pgClient.end().then(async () => {
        await pgClient.connect()
        log('Reconnected to database', 'warn')
      })
    }
  }
}
