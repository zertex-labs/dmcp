import { type Job, jobs } from '../jobs'
import type { JobHandler } from '../jobs/schedule'
import { scheduleTasks } from '../jobs/schedule'
import db from './db'
import { redis } from './redis'
import { log } from './utils'

export const jobHandlers: Partial<Record<Job, JobHandler>> = {}

export const timings: Record<Job, number> = {
  syncFarmingUsers: 3 * 60 * 1000, // 3 minutes
}

export async function registerTimings() {
  log(`Started scheduling ${jobs.length} jobs. (${jobs.join(', ')})`)

  const parsedTimings = Object.entries(timings).map(([job, timing]) => ({
    job: job as Job,
    timing,
  }))

  const handlers = await scheduleTasks(parsedTimings, { db, redis })
  handlers.forEach(({ job, handler }) => {
    jobHandlers[job] = handler
  })

  return handlers
}
