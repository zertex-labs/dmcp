import { Elysia, t } from 'elysia'
import { availablePets } from 'shared'

import { ctx } from '../context'
import { pets } from '../db/schema'
import { getUser, userExists } from '../services/users.service'
import { requireApiSecret } from '../utils/requireApiSecret'
import { resolveServiceResponse, response } from '../utils/response'

export const petsController = new Elysia({
  prefix: '/pets',
  name: 'api:pets',
})
  .use(ctx)
  .get(
    '/owned/:userId',
    async (ctx) => {
      const userRes = await getUser(ctx.params.userId, { pets: true })
      if (userRes.status === 'error' || !userRes.data) return resolveServiceResponse(userRes)

      return response.success(userRes.data.pets ?? [])
    },
    { beforeHandle: requireApiSecret, detail: { tags: ['Pets'] } },
  )
  .put(
    '/giveToUser',
    async (ctx) => {
      if (!(await userExists(ctx.body.ownerId))) return response.error('User not found', 404)

      return await ctx.db
        .insert(pets)
        .values(ctx.body)
        .returning({ uuid: pets.uuid })
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

// TODO: Add endpoints
