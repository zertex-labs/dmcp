import fs from 'node:fs'
import path from 'node:path'
import type { MaybePromise } from 'shared'
import { Logger } from 'shared'

import type db from '../src/db'
import type { redis } from '../src/redis'
import { type Job, jobs } from '.'

export function isValidJob(arg: string): arg is Job {
  const filename = arg.startsWith('!') ? arg.slice(1) : arg
  return jobs.includes(filename as Job)
}

// export function isValidInput(arg: string): arg is `-${string}=${number}` {
//   return arg.startsWith('-') && arg.includes('=')
// }

// export function rawToProperJobInput(arg: string): `${Job}=${number}` {
//   if (!isValidInput(arg)) throw new Error(`Invalid input: ${arg}`)

//   const spl = arg.split('=')
//   const job = spl[0]!.slice(1)
//   if (!isValidJob(job)) throw new Error(`Invalid job: ${job}`)

//   const timing = +spl[1]!
//   if (Number.isNaN(timing)) throw new Error(`Invalid timing: ${timing}`)
//   return `${job}=${timing}`
// }

// export function proccessJobInput(input: `${Job}=${number}`): {
//   job: Job
//   timing: number
// } {
//   const inputSpl = input.split('=')
//   return { job: inputSpl[0] as Job, timing: +inputSpl[1]! }
// }

const logger = new Logger('scripts/jobs/jobLogs.log', {
  date: 'bgRed',
  info: 'red',
  error: 'bgRed',
})

interface Args { db: typeof db; redis: typeof redis }
interface JobInput { job: Job; timing: number }
export type JobHandler = (args: Args) => MaybePromise<void>
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
    console.log(filename)
    return { handler, immediate, ...inputData } as const
  }))

  handlers.forEach(({ job, timing, handler, immediate }) => {
    const middleware = async () => {
      logger.log(`+${job}`, undefined, {
        info: 'cyan',
      })

      return await handler(args)
    }

    logger.log(`Registered ${immediate ? '!' : ''}${job} with timing of ${timing}`)
    setInterval(middleware, timing)

    if (immediate) middleware()
  })

  return handlers
}
