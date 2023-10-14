import Elysia from 'elysia'
import { ctx } from '../context'

export const farmingController = new Elysia({
  prefix: '/farming',
  name: 'api:farming',
}).use(ctx)
