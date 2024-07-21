import fs from 'node:fs'
import path from 'node:path'
import type { MaybePromise } from 'shared'
import { Logger, genericMakeLog } from 'shared'

import type db from '../src/db'
import type { redis } from '../src/redis'
import { type Job, jobs } from '.'

export function isValidJob(arg: string): arg is Job {
  const filename = arg.startsWith('!') ? arg.slice(1) : arg
  return jobs.includes(filename as Job)
}

export const logger = new Logger('jobs/jobLogs.log', {
  date: 'bgRed',
  info: 'red',
  error: 'bgRed',
})

export const makeLog = genericMakeLog(logger)

export interface Args { db: typeof db; redis: typeof redis }
export interface AdditionalJobHandlerArgs { logger: typeof logger; makeLog: ReturnType<typeof genericMakeLog> }
interface JobInput { job: Job; timing: number }
export type JobHandler = (args: Args & AdditionalJobHandlerArgs) => MaybePromise<void>
type JobWithHandler = JobInput & {
  immediate: boolean
  handler: JobHandler
}

export async function scheduleTasks(inputs: JobInput[], args: Args) {
  const filenames = fs.readdirSync(path.join(__dirname, 'handlers')).map(f => f.replace('.ts', '')).filter(isValidJob)

  const handlers: JobWithHandler[] = await Promise.all(filenames.map(async (filename) => {
    const immediate = filename.startsWith('!')

    const inputData = inputs.find(({ job }) => job === (immediate ? filename.slice(1) : filename))!
    const handler = (await import(`./handlers/${filename}.ts`)).default
    return { handler, immediate, ...inputData } as const
  }))

  handlers.forEach(({ job, timing, handler, immediate }) => {
    const middleware = async () => {
      logger.log(`+${job}`, 'info', {
        overwriteColors: { info: 'cyan' },
      })

      const start = performance.now()
      const res = await handler({ ...args, logger, makeLog })

      logger.log(`-${job} (${(performance.now() - start).toFixed(2)}ms)`, 'info', {
        overwriteColors: { info: 'red' },
      })

      return res
    }

    logger.log(`Registered ${immediate ? '!' : ''}${job} with timing of ${timing}`)
    setInterval(middleware, timing)

    if (immediate) middleware()
  })

  return handlers
}
