import { Elysia, t } from 'elysia'
import { ctx } from '../context'
import { farmingActions, handleAction } from '../services/farming.service'
import { resolveServiceResponse } from '../utils/response'

export const farmingController = new Elysia({
  prefix: '/farming',
  name: 'api:farming',
}).use(ctx).post('/action/:action', (ctx) => {
  const { action } = ctx.params
  const res = handleAction(action, ctx.body)
  return resolveServiceResponse(res)
}, {
  params: t.Object({
    action: t.Union(farmingActions.map(x => t.Literal(x))),
  }),
  body: t.Any(),
})
