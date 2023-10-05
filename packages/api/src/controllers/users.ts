import { Elysia, t } from 'elysia';
import { ctx } from '../context';
import { users } from '../db/schema';

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
        .returning({ userId: users.id, petId: users.activePetId });
    },
    {
      body: t.Object({
        petId: t.String()
      })
    }
  );

//TODO: Add endpoints
