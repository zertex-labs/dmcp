import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { ctx } from '../context'
import { users } from '../db/schema'

export const usersController = new Elysia({
  prefix: '/users',
  name: 'api:users',
})
  .use(ctx)
  .get(
    '/:userId',
    async ({ params, db }) => {
      const { userId } = params

      return db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        with: {
          activePet: true,
        },
      })
    },
    {
      beforeHandle: ({ isApiSecretPresent }) => {
        if (!isApiSecretPresent())
          return new Response('Not Authorized', { status: 401 })
      },
    },
  )
  .post(
    '/:userId/selectPet',
    async ({ body, params, db }) => {
      const { userId } = params
      const { petId } = body

      const petExists = db.query.pets.findFirst({
        where: (pets, { eq, and }) => and(eq(pets.ownerId, userId), eq(pets.uuid, petId)),
      })

      if (!petExists) return new Response('Pet does not exist', { status: 404 })

      return db
        .update(users)
        .set({
          activePetId: petId,
        })
        .where(eq(users.id, userId))
        .returning({ userId: users.id, petId: users.activePetId })
    },
    {
      body: t.Object({
        petId: t.String(),
      }),
      beforeHandle: ({ isApiSecretPresent }) => {
        if (!isApiSecretPresent())
          return new Response('Not Authorized', { status: 401 })
      },
    },
  )
  .get(
    '/:userId/activePet',
    async ({ params, db }) => {
      const { userId } = params

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      })

      if (!user) return new Response('User does not exist', { status: 404 })

      const petId = user.activePetId
      if (!petId) {
        return new Response('User does not have an active pet', {
          status: 404,
        })
      }

      return db.query.pets.findFirst({
        where: (pets, { eq }) => eq(pets.uuid, `${petId}`),
      })
    },
    {
      beforeHandle: ({ isApiSecretPresent }) => {
        if (!isApiSecretPresent())
          return new Response('Not Authorized', { status: 401 })
      },
    },
  )

// TODO: Add endpoints
