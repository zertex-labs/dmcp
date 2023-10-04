// import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { config } from "./config";
import { ctx } from "./context";
import { api } from "./controllers/*";

const app = new Elysia()
  .use(api)
  .onError(({ code, error, request }) => {
    // log.error(` ${request.method} ${request.url}`, code, error);
    console.error(error);
  })
  .listen(3000);

export type App = typeof app;

console.log(
  `app is listening on http://${app.server?.hostname}:${app.server?.port}`,
);