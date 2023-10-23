import { type Job, jobs } from '../jobs'
import { scheduleTasks } from '../jobs/schedule'
import db from './db'
import { redis } from './redis'

export async function registerTimings() {
  console.log(`Started scheduling ${jobs.length} jobs. (${jobs.join(', ')})`)

  const timings: Record<Job, number> = {
    syncFarmingUsers: 10 * 60 * 1000,
  }

  const parsedTimings = Object.entries(timings).map(([job, timing]) => ({
    job: job as Job,
    timing,
  }))

  const handlers = await scheduleTasks(parsedTimings, { db, redis })

  return handlers
}
