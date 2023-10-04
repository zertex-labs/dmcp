import Elysia from "elysia";
import { ctx } from "../context";

export const petsController = new Elysia({
  prefix: "/pets",
})
.use(ctx)

//TODO: Add endpoints
