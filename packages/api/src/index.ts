// import { swagger } from "@elysiajs/swagger";
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import type { Job } from '../jobs'
import { jobs } from '../jobs'
import { scheduleTasks } from '../jobs/schedule'
import { api } from './controllers/*'
import db from './db'
import { redis } from './redis'

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'DMCP API',
        version: '1.0.0',
      },
      tags: [
        { name: 'Users', description: 'User related end-points' },
        { name: 'Farming', description: 'Farming related end-points' },
        { name: 'Pets', description: 'Pet related end-points' },
      ],
    },
  }))
  .use(api)
  .onError(({ log, error }) => {
    log.error(error)
  })

app.listen(3000);

(async () => {
  console.log(`Started scheduling ${jobs.length} jobs. (${jobs.join(', ')})`)

  const timings: Record<Job, number | { timing: number; immediate: true }> = {
    syncFarmingUsers: {
      immediate: true,
      timing: 10 * 60 * 1000,
    },
  }

  const parsedTimings = Object.entries(timings).map(([job, timing]) => typeof timing === 'object'
    ? ({
        immediate: timing.immediate,
        job: job as Job,
        timing: timing.timing,
      })
    : ({
        immediate: false,
        job: job as Job,
        timing,
      }))

  scheduleTasks(parsedTimings, { db, redis })

  return parsedTimings
}
)().then((timings) => {
  const t = Object.values(timings)
  console.log(`Scheduled ${t.length} jobs. ${t.map(x => `${x.immediate ? '*' : ''}${x.job}:${x.timing}ms`).join(', ')}`)
})

export type App = typeof app

console.log(
  `🦊 App is listening on http://${app.server?.hostname}:${app.server?.port}`,
)
