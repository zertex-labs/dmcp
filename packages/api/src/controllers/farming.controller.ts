import Elysia, { t } from 'elysia'
import type { Crop, FarmingUser, Rarity } from 'shared'
import { calculateCropPrice, createBaseStats, getPetSkeleton, validSellCropInputs } from 'shared'

import { ctx } from '../context'
import { getAllItems } from '../redis'
import type { FarmingResolvers } from '../services/farming.service'
import { farmingActions, handleAction } from '../services/farming.service'
import { calculateUserStats, doFarm, getFarmingUser, getOrCreateFarmingUser, parseAllFoodItemsWithChances } from '../services/helpers/farming.helpers'
import { getUser, giveUserBalance } from '../services/users.service'
import { requireApiSecret, useFarmingUsersBatcher } from '../utils'
import { resolveServiceResponse, response } from '../utils/response'

const allItems = parseAllFoodItemsWithChances()
const batcher = useFarmingUsersBatcher()

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
    const farmingUser = await getOrCreateFarmingUser({
      farmingResponse,
      user,
    })

    return response.service.success({ farmingUser, farmingResponse })
  },
} satisfies FarmingResolvers

export const farmingController = new Elysia({
  prefix: '/farming',
  name: 'api:farming',
},
)
  .use(ctx)
  .get('/leaderboard', async () => {
    const cachedUsers = Object.values(await getAllItems<string, FarmingUser>({ key: 'farmingUser' }))
    return response.success([...batcher.all(), ...cachedUsers].sort((a, b) => b.totalWeight - a.totalWeight).slice(0, 10))
  }, {
    detail: { tags: ['Farming'], description: 'Get top 10 farming users by total' },
  })

  .get('/user/:userId', async (ctx) => {
    const fuser = await getFarmingUser(ctx.params.userId, true)
    console.log(fuser, 'fuser')
    if (!fuser) return response.service.error('User not found', 404)
    return response.success(fuser)
  }, {
    detail: { tags: ['Farming'], description: 'Get farming user by discord id' },
  })

  .post('/sell/:crop', async ({ params, body }) => {
    const { crop } = params
    const { userId } = body

    const farmingUser = await getFarmingUser(userId, true)
    if (!farmingUser) return response.service.error('User not found', 404)

    let totalValue = 0
    let cropAmount = 0
    if (crop === 'ALL') {
      const individual = Object.entries(farmingUser.individual) as [Crop, number][]
      cropAmount = farmingUser.total
      totalValue = individual.reduce((acc, [cropName, userAmount]) => {
        const cropPrice = calculateCropPrice(cropName, userAmount)
        return acc + cropPrice
      }, 0)

      farmingUser.total = 0
      farmingUser.individual = {
        CARROT: 0,
        CHORUS_FRUIT: 0,
        SUGAR_CANE: 0,
        WHEAT: 0,
      }
    }
    else {
      const { amount } = body

      const userAmount = farmingUser.individual[crop]
      cropAmount = amount ? Math.min(amount, userAmount) : userAmount
      const cropPrice = calculateCropPrice(crop, cropAmount)
      totalValue = cropPrice

      farmingUser.individual[crop] -= cropAmount
    }

    console.log(userId, totalValue)

    const giveRes = await giveUserBalance(userId, totalValue)
    if (giveRes.status === 'error') return resolveServiceResponse(giveRes)

    batcher.createOrUpdate(farmingUser)

    return response.success({
      totalValue,
      amount: cropAmount,
    })
  }, {
    beforeHandle: requireApiSecret,
    detail: { tags: ['Farming'], description: 'Sell a crop' },
    params: t.Object({
      crop: t.Union(validSellCropInputs.map(x => t.Literal(x))),
    }),
    body: t.Object({
      userId: t.String(),
      amount: t.Optional(t.Integer({ minimum: 1 })),
    }),
  })

  .post('/action/:action', async (ctx) => {
    const { action } = ctx.params
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
