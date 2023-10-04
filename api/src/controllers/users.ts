import Elysia from "elysia";
import { ctx } from "../context";

export const usersController = new Elysia({
  prefix: "/users",
})
.use(ctx)

//TODO: Add endpoints
