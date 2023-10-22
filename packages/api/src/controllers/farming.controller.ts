import Elysia, { t } from 'elysia'
import type { Rarity } from 'shared'
import { createBaseStats, getPetSkeleton } from 'shared'

import { ctx } from '../context'
import type { FarmingResolvers } from '../services/farming.service'
import { farmingActions, handleAction } from '../services/farming.service'
import { calculateUserStats, doFarm, getFarmingUser, parseAllFoodItemsWithChances } from '../services/helpers/farming.helpers'
import { getUser } from '../services/users.service'
import { resolveServiceResponse, response } from '../utils/response'

const allItems = parseAllFoodItemsWithChances()

/**
 * If a resolver returns undefined/null it will be treated as a 400 bad request
 *
 * If a resolver returns anything else it will be passed down as a {@link ServiceResponse}
 */
export const resolvers = {
  farm: async ({ userId }) => {
    const userRes = await getUser(userId)
    if (userRes.status === 'error') return userRes

    const user = userRes.data
    if (!user) return response.service.error('User not found', 404)

    let stats = createBaseStats()
    let rarity: Rarity = 'COMMON'

    if (user.activePet) {
      const skeleton = getPetSkeleton(user.activePet)
      rarity = skeleton.rarity
      stats = calculateUserStats({ ...user.activePet, ...skeleton }, stats)
    }

    const farmingResponse = doFarm({ stats, rarity, allItems })
    const farmingUser = await getFarmingUser({
      farmingResponse,
      user,
    })

    return response.service.success({ farmingUser, farmingResponse })
  },
} satisfies FarmingResolvers

export const farmingController = new Elysia({
  prefix: '/farming',
  name: 'api:farming',
}).use(ctx).post('/action/:action', async (ctx) => {
  const { action } = ctx.params
  console.log(action, ctx.body)
  const res = await handleAction(resolvers, action, ctx.body)
  return resolveServiceResponse(res)
}, {
  params: t.Object({
    action: t.Union(farmingActions.map(x => t.Literal(x))),
  }),
  detail: {
    tags: ['Farming'],
    parameters: [
      {
        in: 'path',
        name: 'action',
        required: true,
        schema: {
          type: 'string',
          enum: farmingActions as unknown as string[],
        },
      },
    ],
    responses: {
      400: {
        description: 'Bad request',
      },
      200: {
        description: 'Success',
      },
    },
  },
})
