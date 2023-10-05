import { Elysia, t } from 'elysia';
import { ctx } from '../context';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const usersController = new Elysia({
  prefix: '/users'
})
  .use(ctx)
  .put(
    '/:userId/selectPet',
    async ({ body, params, db }) => {
      const { userId } = params;
      const { petId } = body;

      const petExists = db.query.pets.findFirst({
        where: (pets, { eq, and }) =>
          and(eq(pets.ownerId, userId), eq(pets.uuid, petId))
      });

      if (!petExists) {
        return new Response('Pet does not exist', { status: 404 });
      }

      return db
        .update(users)
        .set({
          activePetId: petId
        })
        .where(eq(users.id, userId))
        .returning({ userId: users.id, petId: users.activePetId });
    },
    {
      body: t.Object({
        petId: t.String()
      })
    }
  )
  .get('/:userId/activePet', async ({ params, db }) => {
    const { userId } = params;

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId)
    });

    if (!user) {
      return new Response('User does not exist', { status: 404 });
    }

    let petId = user.activePetId;
    if (!petId) {
      return new Response('User does not have an active pet', { status: 404 });
    }

    return db.query.pets.findFirst({
      where: (pets, { eq }) => eq(pets.uuid, `${petId}`)
    });
  });

//TODO: Add endpoints
