import { Elysia, t } from 'elysia'
import { availablePets } from 'shared'

import { ctx } from '../context'
import { pets } from '../db/schema'
import { createUser, getUser, userExists } from '../services/users.service'
import { requireApiSecret } from '../utils/requireApiSecret'
import { resolveServiceResponse, response } from '../utils/response'
import { getPet } from '../services/pets.service'
import { deleteAllItems } from '../redis/deleteAllItems'
import { error } from '../utils'

export const petsController = new Elysia({
  prefix: '/pets',
  name: 'api:pets',
})
  .use(ctx)
  .get(
    '/owned/:userId',
    async (ctx) => {
      const { userId } = ctx.params
      const userRes = await getUser(userId, { pets: true })
      if (userRes.status === 'error') return resolveServiceResponse(userRes)

      const user = userRes.data
      if (!user) {
        const createRes = await createUser({ id: userId })
        if (createRes.status === 'error') return resolveServiceResponse(createRes)

        return response.success([])
      }

      return response.success(user.pets ?? [])
    },
    { beforeHandle: requireApiSecret, detail: { tags: ['Pets'] } },
  )
  .get(
    '/:petId/',
    async ctx => resolveServiceResponse(await getPet({ uuid: ctx.params.petId, ownerId: ctx.body.ownerId })),
    {
      beforeHandle: requireApiSecret,
      body: t.Object({
        ownerId: t.Optional(t.String()),
      }),
      detail: { tags: ['Pets'] },
    },
  )
  .put(
    '/giveToUser',
    async (ctx) => {
      if (!(await userExists(ctx.body.ownerId))) return response.error('User not found', 404)

      try {
        const out = await ctx.db
          .insert(pets)
          .values(ctx.body)
          .returning({ uuid: pets.uuid })

        const deletedIsSuccess = await deleteAllItems({
          key: 'dbUser',
          value: ctx.body.ownerId,
        })

        if (!deletedIsSuccess) console.warn('Failed to delete user cache')

        return out
      }
      catch (e: any) {
        error(e, `Failed to give pet to user ${JSON.stringify(ctx.body)}`)
        return response.predefined.internalError
      }
    },
    {
      beforeHandle: requireApiSecret,
      body: t.Object({
        type: t.Union(availablePets.map(x => t.Literal(x))),
        ownerId: t.String(),
        displayName: t.String(),
      }),
      detail: { tags: ['Pets'] },
    },
  )
