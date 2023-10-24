// import { swagger } from "@elysiajs/swagger";
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'

import { api } from './controllers/*'
import { registerTimings } from './timings'
import { log } from './utils'
import { setupGracefulShutdown } from './utils/gracefulShutdown'

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

setupGracefulShutdown(app)

registerTimings().then((handlers) => {
  const hv = Object.values(handlers)
  log(`Scheduled ${hv.length} jobs. ${hv.map(x => `${x.immediate ? '*' : ''}${x.job}:${x.timing}ms`).join(', ')}`)
})

app.listen(3000)
log(`🦊 App is listening on http://${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
