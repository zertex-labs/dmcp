// import { swagger } from "@elysiajs/swagger";
import { Elysia } from 'elysia'
import swagger from '@elysiajs/swagger'
import { api } from './controllers/*'

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
  .onError(({ error }) => {
    console.error(error)
  })
  .listen(3000)

export type App = typeof app

console.log(
  `🦊 App is listening on http://${app.server?.hostname}:${app.server?.port}`,
)
