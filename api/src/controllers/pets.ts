import { Elysia, t } from "elysia";
import { ctx } from "../context";
import { AvailablePet, availablePets } from "../redis";
import { Mutable, StringEnum } from "../types";
import { pets } from "../db/schema";

const isValidPet = (petType: string): petType is AvailablePet => {
  return availablePets.includes(petType as any);
}

export const petsController = new Elysia({
  prefix: "/pets",
})
  .use(ctx)
  .put(
    "/giveToUser",
    async (ctx) => {
      const { petType, ownerId, displayName } = ctx.body;
      if (!isValidPet(petType)) {
        return new Response("Invalid Pet Type", { status: 400 });
      }
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
      body: t.Object({
        petType: t.String(),
        ownerId: t.String(),
        displayName: t.String(),
      }),
    }
  );

//TODO: Add endpoints
