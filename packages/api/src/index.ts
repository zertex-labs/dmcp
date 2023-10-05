// import { swagger } from "@elysiajs/swagger";
import { Elysia } from 'elysia';

import { api } from './controllers/*';

const app = new Elysia()
  .use(api)
  .onError(({ code, error, request, log }) => {
    console.error(error);
  })
  .listen(3000);

export type App = typeof app;

console.log(
  `🦊 App is listening on http://${app.server?.hostname}:${app.server?.port}`
);
