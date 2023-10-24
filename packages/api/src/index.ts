// import { swagger } from "@elysiajs/swagger";
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { genericMakeLog } from 'shared'

import { logger, makeLog } from '../jobs/schedule'
import { api } from './controllers/*'
import db from './db'
import { redis } from './redis'
import { jobHandlers, registerTimings } from './timings'
import { log, useFarmingUsersBatcher } from './utils'

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

async function syncBatcher() {
  const batcher = useFarmingUsersBatcher()
  const users = batcher.all()
  console.log(users)
  if (users.length === 0) return

  await jobHandlers.syncFarmingUsers!({
    db,
    redis,
    logger,
    makeLog,
  })
}

async function stop() {
  app.stop()
  syncBatcher().then(
    void new Promise(res => setTimeout(res, 10)).then(() => process.exit()),
  )
}

registerTimings().then((handlers) => {
  const hv = Object.values(handlers)
  log(`Scheduled ${hv.length} jobs. ${hv.map(x => `${x.immediate ? '*' : ''}${x.job}:${x.timing}ms`).join(', ')}`)
})

await app.listen(3000)
log(`🦊 App is listening on http://${app.server?.hostname}:${app.server?.port}`)

process.on('beforeExit', stop)
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
process.on('SIGKILL', stop)

export type App = typeof app
