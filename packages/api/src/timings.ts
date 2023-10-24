import { type Job, jobs } from '../jobs'
import { scheduleTasks } from '../jobs/schedule'
import db from './db'
import { redis } from './redis'
import { log } from './utils'

export async function registerTimings() {
  log(`Started scheduling ${jobs.length} jobs. (${jobs.join(', ')})`)

  const timings: Record<Job, number> = {
    syncFarmingUsers: 0.1 * 60 * 1000,
  }

  const parsedTimings = Object.entries(timings).map(([job, timing]) => ({
    job: job as Job,
    timing,
  }))

  const handlers = await scheduleTasks(parsedTimings, { db, redis })

  return handlers
}
