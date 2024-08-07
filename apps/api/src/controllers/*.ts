import Elysia from 'elysia'
import { usersController } from './users.controller'
import { petsController } from './pets.controller'
import { farmingController } from './farming.controller'
import { internalController } from './internal.controller'
import { shopController } from './shop.controller'

export const api = new Elysia({
  prefix: '/api',
  name: 'api:root',
})
  .use(usersController)
  .use(petsController)
  .use(farmingController)
  .use(internalController)
  .use(shopController)
