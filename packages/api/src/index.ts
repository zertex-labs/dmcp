// import { swagger } from "@elysiajs/swagger";
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { api } from './controllers/*'
import { registerTimings } from './timings'

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
  .listen(3000)

registerTimings().then((handlers) => {
  const hv = Object.values(handlers)
  console.log(`Scheduled ${hv.length} jobs. ${hv.map(x => `${x.immediate ? '*' : ''}${x.job}:${x.timing}ms`).join(', ')}`)
})

export type App = typeof app

console.log(
  `🦊 App is listening on http://${app.server?.hostname}:${app.server?.port}`,
)
