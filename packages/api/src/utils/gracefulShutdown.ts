import type Elysia from 'elysia'
import db from '../db'
import { redis } from '../redis'
import { jobHandlers } from '../timings'
import { logger, makeLog } from '../../jobs/schedule'
import { useFarmingUsersBatcher } from './useFarmingUsersBatcher'

export function setupGracefulShutdown(app: Elysia) {
  const signals = ['SIGINT', 'SIGTERM', 'SIGKILL', 'beforeExit'] as const

  signals.forEach(signal => process.on(signal, app.stop))

  app.onStop(async () => {
    signals.forEach(signal => process.off(signal, app.stop))
    logger.log('Stopping')

    await syncBatcher()

    logger.log('Stopped')

    new Promise(res => setTimeout(res, 10)).then(() => process.exit())
  })
}
async function syncBatcher() {
  const batcher = useFarmingUsersBatcher()
  const users = batcher.all()
  if (users.length === 0) {
    logger.log('No users to sync, skipping syncBatcher')
    return
  }

  await jobHandlers.syncFarmingUsers!({
    db,
    redis,
    logger,
    makeLog,
  })
}
