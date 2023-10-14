import Elysia from 'elysia'
import { usersController } from './users.controller'
import { petsController } from './pets.controller'
import { farmingController } from './farming.controller'

export const api = new Elysia({
  prefix: '/api',
  name: 'api:root',
})
  .use(usersController)
  .use(petsController)
  .use(farmingController)
