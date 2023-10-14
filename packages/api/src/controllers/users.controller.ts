import { Elysia, t } from 'elysia'

import { ctx } from '../context'
import { createUser, getUser, selectPet } from '../services/users.service'
import { requireApiSecret } from '../utils/requireApiSecret'
import { resolveServiceResponse, response } from '../utils/response'

export const usersController = new Elysia({
  prefix: '/users',
  name: 'api:users',
})
  .use(ctx)
  .get(
    '/:userId',
    async ctx => resolveServiceResponse(await getUser(ctx.params.userId, ctx.query)),
    {
      beforeHandle: requireApiSecret,
      query: t.Object({
        activePet: t.Optional(t.Boolean()),
        pets: t.Optional(t.Boolean()),
      }),
    },
  )

  .put(
    '/create',
    async ctx => resolveServiceResponse(await createUser(ctx.body)),
    {
      beforeHandle: requireApiSecret,
      body: t.Object({
        id: t.String(),
      }),
    },
  )

  .post(
    '/:userId/selectPet',
    async ctx => resolveServiceResponse(await selectPet({ userId: ctx.params.userId, petId: ctx.body.petId })),
    {
      body: t.Object({
        petId: t.String(),
      }),
      beforeHandle: requireApiSecret,
    },
  )
  .get(
    '/:userId/activePet',
    async (ctx) => {
      const userRes = await getUser(ctx.params.userId)
      if (userRes.status === 'error') return resolveServiceResponse(userRes) // will be an internal error

      const user = userRes.data
      if (!user) return response.error('User not found', 404)

      if (!user.activePet)
        return response.error('User has no active pet', 404)

      return response.success(user.activePet)
    },
    { beforeHandle: requireApiSecret },
  )
