import { Elysia, t } from 'elysia'

import { ctx } from '../context'
import { insertUserSchema } from '../db/schema/users'
import { createUser, getUser, getUserWithParamateres, selectPet } from '../services/users.service'
import { requireApiSecret } from '../utils/requireApiSecret'
import { resolveServiceResponse, response } from '../utils/response'

// :) critical brain damage below :)
const truthfulBooleanVariants = ['1', 'true', 'sure'] as const
const falsyBooleanVariants = ['0', 'false', 'nah'] as const
const booleanVariants = [...truthfulBooleanVariants, ...falsyBooleanVariants] as const

export const usersController = new Elysia({
  prefix: '/users',
  name: 'api:users',
})
  .use(ctx)
  .get(
    '/:userId',
    async ctx => resolveServiceResponse(await getUser(
      ctx.params.userId,
      Object.entries(ctx.query ?? {}).reduce((acc, [k, v]) => ({ ...acc, [k]: truthfulBooleanVariants.includes(v as any) }), {}),
    )),
    {
      beforeHandle: requireApiSecret,
      query: t.Object({
        ...getUserWithParamateres.reduce((acc, cur) => ({ ...acc, [cur]: t.Optional(t.Union(booleanVariants.map(x => t.Literal(x)))) }), {}),
      }),
      detail: { tags: ['Users'] },
    },
  )

  .put(
    '/create',
    async ctx => resolveServiceResponse(await createUser(ctx.body)),
    {
      beforeHandle: requireApiSecret,
      body: insertUserSchema,
      detail: { tags: ['Users'] },
    },
  )

  .post(
    '/:userId/selectPet',
    async ctx => resolveServiceResponse(await selectPet({ userId: ctx.params.userId, petId: ctx.body.petId })),
    {
      body: t.Object({ petId: t.String() }),
      beforeHandle: requireApiSecret,
      detail: { tags: ['Users'] },
    },
  )
  .get(
    '/:userId/activePet',
    async (ctx) => {
      console.log('ctx.params.userId', ctx.params.userId)
      const userRes = await getUser(ctx.params.userId)
      if (userRes.status === 'error') return resolveServiceResponse(userRes) // will be an internal error

      const user = userRes.data
      if (!user) return resolveServiceResponse(response.service.error('User not found', 404))

      if (!user.activePet)
        return response.error('User has no active pet', 404)

      return response.success(user.activePet)
    },
    { beforeHandle: requireApiSecret, detail: { tags: ['Users'] } },
  )
