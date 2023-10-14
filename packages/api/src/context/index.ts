import { Elysia } from 'elysia'
import { HoltLogger } from '@tlscipher/holt'
import { logger } from '@bogeychan/elysia-logger'

import { data } from 'shared'
import pretty from 'pino-pretty'

import { config } from '../config'
import { db } from '../db'
import { redis } from '../redis'

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
  .decorate('redis', redis)

  .state('config', config)
  .state('localData', data)

  .use(logger(loggerConfig))
  .use(
    // @ts-expect-error ts shits itself and gives up on life
    config.env.NODE_ENV === 'development'
      ? new HoltLogger().getLogger()
      : a => a,
  )

  .derive(async ({ headers, store }) => ({
    isApiSecretPresent: () => headers['x-api-secret'] === config.env.API_SECRET,
    isAdmin: (userId: string) => userId in store.localData.adminIds,
  }))

  .onStart(({ log }) => {
    if (log && config.env.NODE_ENV === 'production') log.info('Server started')
  })
  .onStop(({ log }) => {
    if (log && config.env.NODE_ENV === 'production') log.info('Server stopped')
  })
  .onRequest(({ log, request }) => {
    if (log && config.env.NODE_ENV === 'production')
      log.debug(`Request received: ${request.method}: ${request.url}`)
  })
  .onResponse(({ log, request }) => {
    if (log && config.env.NODE_ENV === 'production')
      log.debug(`Response sent: ${request.method}: ${request.url}`)
  })
  .onError(({ log, error }) => {
    if (log && config.env.NODE_ENV === 'production') log.error(error)
  })
