import { Elysia, t } from "elysia";
import { availablePets } from "shared";

import { ctx } from "../context";
import { pets } from "../db/schema";

export const petsController = new Elysia({
  prefix: "/pets",
})
  .use(ctx)
  .get(
    "/owned/:userId",
    async ({ params, db }) => {
      const { userId } = params;

      return await db.query.pets.findMany({
        where: (pets, { eq }) => eq(pets.ownerId, userId),
        with: {
          owner: true,
        },
      });
    },
    {
      beforeHandle: ({ isApiSecretPresent }) => {
        if (!isApiSecretPresent()) {
          return new Response("Not Authorized", { status: 401 });
        }
      },
    }
  )
  .put(
    "/giveToUser",
    async (ctx) => {
      const { petType, ownerId, displayName } = ctx.body;
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, ownerId),
      });
      if (!user) {
        return new Response("User Not Found", { status: 404 });
      }
      return await ctx.db
        .insert(pets)
        .values({
          ownerId,
          displayName,
          type: petType,
        })
        .returning({ uuid: pets.uuid });
    },
    {
      beforeHandle: ({ isApiSecretPresent }) => {
        if (!isApiSecretPresent()) {
          return new Response("Not Authorized", { status: 401 });
        }
      },
      body: t.Object({
        petType: t.Union(availablePets.map((x) => t.Literal(x))),
        ownerId: t.String(),
        displayName: t.String(),
      }),
    }
  );

//TODO: Add endpoints

