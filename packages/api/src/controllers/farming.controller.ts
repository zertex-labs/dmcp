import { Elysia, t } from 'elysia'
import { ctx } from '../context'
import { farmingActions } from '../services/farming.service'

export const farmingController = new Elysia({
  prefix: '/farming',
  name: 'api:farming',
}).use(ctx).post('/:userId/action/:action', (ctx) => {
  const { action, userId } = ctx.params
}, {
  params: t.Object({
    userId: t.String(),
    action: t.Union(farmingActions.map(x => t.Literal(x))),
  }),
})
