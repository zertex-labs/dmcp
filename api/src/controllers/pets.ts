import Elysia from "elysia";
import { ctx } from "../context";

export const petsController = new Elysia({
  prefix: "/users",
})
.use(ctx)

//TODO: Add endpoints
