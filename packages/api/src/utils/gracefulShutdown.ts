import type Elysia from 'elysia'
import db from '../db'
import { redis } from '../redis'
import { jobHandlers } from '../timings'
import { logger, makeLog } from '../../jobs/schedule'
import { useFarmingUsersBatcher } from './useFarmingUsersBatcher'

export function setupGracefulShutdown(app: Elysia) {
  const signals = ['SIGINT', 'SIGTERM', 'SIGKILL', 'beforeExit'] as const

  const stop = async () => {
    logger.log('Stopping...')

    await syncBatcher()
    app.stop()

    logger.log('Stopped.')

    new Promise(res => setTimeout(res, 10)).then(() => process.exit())
  }
  signals.forEach(signal => process.on(signal, stop))
}
async function syncBatcher() {
  const batcher = useFarmingUsersBatcher()
  const users = batcher.all()
  if (users.length === 0) return

  await jobHandlers.syncFarmingUsers!({
    db,
    redis,
    logger,
    makeLog,
  })
}
