import { Elysia } from 'elysia'

import pretty from 'pino-pretty'

import * as data from 'metadata'

import { config } from '../config'
import { db } from '../db'
import * as schema from '../db/schema'

const loggerConfig
  = config.env.NODE_ENV === 'development'
    ? {
        level: config.env.LOG_LEVEL,
        stream: pretty({
          colorize: true,
        }),
      }
    : { level: config.env.LOG_LEVEL }

export const ctx = new Elysia({
  name: '@app/ctx',
})
  .decorate('db', db)
  // .decorate('redis', redis)

  .state('config', config)
  .state('localData', data)
  .state('schema', schema)

  // if whole context dies randomly ever again it's 99.9% cause of this shitty logger. Try reinstalling the dependancies again if it happens
  // .use(logger(loggerConfig))
  // .use(
  //   // @ts-expect-error ts shits itself and gives up on life
  //   config.env.NODE_ENV === 'development'
  //     ? new HoltLogger().getLogger()
  //     : a => a,
  // )

  .derive(async ({ headers, store }) => ({
    isApiSecretPresent: () => headers['x-api-secret'] === config.env.API_SECRET,
    isAdmin: (userId: string) => userId in store.localData.adminIds,
  }))
