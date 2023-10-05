import Elysia from "elysia";
import { usersController } from "./users";
import { petsController } from "./pets";

export const api = new Elysia({
  prefix: "/api",
})
  .use(usersController)
  .use(petsController)
