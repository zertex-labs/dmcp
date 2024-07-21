import { Elysia, t } from 'elysia'
import { ctx } from '../context'
import { getShop } from '../services/helpers/shop.helpers'
import { requireApiSecret, resolveServiceResponse, response } from '../utils'
import { getUser } from '../services/users.service'

export const shopController = new Elysia({
  prefix: '/shop',
  name: 'api:shop',
})
  .use(ctx)
  .get(':date', async ({ params }) => {
    const { date } = params
    const shop = await getShop(date)
    if (!shop)
      return response.predefined.internalError

    return response.success(shop)
  }, {
    detail: { tags: ['Shop'], description: 'Get shop items for a specific date' },
  })
  .post('/purchase/:date', async ({ params, body }) => {
    const { date } = params
    const shop = await getShop(date)
    if (!shop)
      return response.predefined.internalError

    const { itemIndex, userId } = body
    const item = shop.items?.[itemIndex]
    if (!item)
      return response.error('Invalid item index')

    const userRes = await getUser(userId)
    if (userRes.status === 'error') return resolveServiceResponse(userRes)

    const user = userRes.data

    return response.success({
      shopItem: item,
      user,
    })
  }, {
    detail: { tags: ['Shop'], description: 'Purchase an item from the shop' },
    body: t.Object({
      itemIndex: t.Number({ minimum: 0 }),
      userId: t.String(),
    }),
  })
