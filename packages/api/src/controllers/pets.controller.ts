import { Elysia, t } from 'elysia'
import { availablePets } from 'shared'

import { ctx } from '../context'
import { pets, users } from '../db/schema'

export const petsController = new Elysia({
  prefix: '/pets',
  name: 'api:pets',
})
  .use(ctx)
  .get(
    '/owned/:userId',
    async ({ params, db, log }) => {
      const { userId } = params

      const res = await db.query.pets.findMany({
        where: (pets, { eq }) => eq(pets.ownerId, userId),
        with: {
          owner: true,
        },
      })
      log.error(res)

      return new Response(JSON.stringify(res), {
        status: 200,
      })
    },
    {
      beforeHandle: ({ isApiSecretPresent }) => {
        if (!isApiSecretPresent())
          return new Response('Not Authorized', { status: 401 })
      },
    },
  )
  .put(
    '/giveToUser',
    async (ctx) => {
      const { petType, displayName } = ctx.body
      let { ownerId } = ctx.body
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ownerId),
      })
      if (!user) {
        const insertRes = await ctx.db
          .insert(users)
          .values({
            id: ownerId,
          })
          .returning({ userId: users.id })

        if (insertRes.length === 0)
          return new Response('Internal Server Error', { status: 500 })

        ownerId = insertRes[0].userId
      }

      return await ctx.db
        .insert(pets)
        .values({
          ownerId,
          displayName,
          type: petType,
        })
        .returning({ uuid: pets.uuid })
    },
    {
      beforeHandle: ({ isApiSecretPresent }) => {
        if (!isApiSecretPresent())
          return new Response('Not Authorized', { status: 401 })
      },
      body: t.Object({
        petType: t.Union(availablePets.map(x => t.Literal(x))),
        ownerId: t.String(),
        displayName: t.String(),
      }),
    },
  )

// TODO: Add endpoints
