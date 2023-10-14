import { Elysia, t } from 'elysia'

import { ctx } from '../context'
import { getUser, selectPet } from '../services/users.service'
import { requireApiSecret } from '../utils/requireApiSecret'
import { response, serviceResponse } from '../utils/response'

export const usersController = new Elysia({
  prefix: '/users',
  name: 'api:users',
})
  .use(ctx)
  .get(
    '/:userId',
    async ctx => serviceResponse(await getUser(ctx.params.userId)),
    { beforeHandle: requireApiSecret },
  )
  .post(
    '/:userId/selectPet',
    async ctx => serviceResponse(await selectPet({ userId: ctx.params.userId, petId: ctx.body.petId })),
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
      if (userRes.status === 'error') return serviceResponse(userRes) // will be an internal error

      const user = userRes.data
      if (!user) return response.error('User not found', 404)

      if (!user.activePet)
        return response.error('User has no active pet', 404)

      return response.success(user.activePet)
    },
    { beforeHandle: requireApiSecret },
  )
