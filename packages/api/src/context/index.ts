import { logger } from "@bogeychan/elysia-logger";
import { Elysia } from "elysia";
import pretty from "pino-pretty";

import { config } from "../config";
import { db } from "../db";
import { redis } from "../redis";
import { getAllFoodItems, getAllPets } from "../redis/";

const loggerConfig =
  config.env.NODE_ENV === "development"
    ? {
        level: config.env.LOG_LEVEL,
        stream: pretty({
          colorize: true,
        }),
      }
    : { level: config.env.LOG_LEVEL };

// https://github.com/ethanniser/beth-b2b-saas/blob/main/src/context/index.ts
export const ctx = new Elysia({
  name: "@app/ctx",
})
  .decorate("db", db)
  .decorate("redis", redis)

  .state("config", config)
  .state("food", await getAllFoodItems())
  .state("pets", await getAllPets())

  .use(logger(loggerConfig))

  .derive(async ({ headers }) => ({
    isApiSecretPresent: () => headers["x-api-secret"] === config.env.API_SECRET,
  }))

  .onStart(({ log }) => {
    if (log && config.env.NODE_ENV === "production") {
      log.info("Server started");
    }
  })
  .onStop(({ log }) => {
    if (log && config.env.NODE_ENV === "production") {
      log.info("Server stopped");
    }
  })
  .onRequest(({ log, request }) => {
    if (log && config.env.NODE_ENV === "production") {
      log.debug(`Request received: ${request.method}: ${request.url}`);
    }
  })
  .onResponse(({ log, request, set }) => {
    if (log && config.env.NODE_ENV === "production") {
      log.debug(`Response sent: ${request.method}: ${request.url}`);
    }
  })
  .onError(({ log, error }) => {
    if (log && config.env.NODE_ENV === "production") {
      log.error(error);
    }
  });

