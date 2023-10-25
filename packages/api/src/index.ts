// import { swagger } from "@elysiajs/swagger";
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

import { api } from './controllers/*'
import { registerTimings } from './timings'
import { log } from './utils'
import { setupGracefulShutdown } from './utils/gracefulShutdown'

const app = new Elysia()
  // @ts-expect-error not a promise but it's fine
  .use(staticPlugin({
    prefix: '/images',
    alwaysStatic: true,
  }))
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

// TODO sometimes doesn't trigger. Not a big deal if in prod but sucks in dev...easdqwe321
setupGracefulShutdown(app)

registerTimings().then((handlers) => {
  const hv = Object.values(handlers)
  log(`Scheduled ${hv.length} jobs. ${hv.map(x => `${x.immediate ? '*' : ''}${x.job}:${x.timing}ms`).join(', ')}`)
})

app.listen(3000)
log(`🦊 App is listening on http://${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
