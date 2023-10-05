import { Elysia, t } from "elysia";
import { ctx } from "../context";
import { pets } from "../db/schema";
import { availablePets } from "../redis";

export const petsController = new Elysia({
  prefix: "/pets",
})
  .use(ctx)
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
      beforeHandle: ({ isApiSecretPresent, log }) => {
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

