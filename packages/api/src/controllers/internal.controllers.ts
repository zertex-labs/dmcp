import { Elysia, t } from 'elysia'
import { ctx } from '../context'
import { requireApiSecret, resolveServiceResponse, response } from '../utils'
import { jobs } from '../../jobs'
import { isValidJob, logger, makeLog } from '../../jobs/schedule'
import { jobHandlers, timings } from '../timings'

export const internalController = new Elysia({
  prefix: '/internal',
  name: 'api:internal',
},
)
  .use(ctx)
  .get('/ping', () => 'Pong', {
    detail: { tags: ['Internal'], description: 'Ping the API' },
  })
  .post(`/job/:job/execute`, async (ctx) => {
    const { job } = ctx.params
    console.log(job)
    if (!isValidJob(job)) return response.error(`Invalid job name, valid names are: ${jobs.join(', ')}`)

    await jobHandlers[job]!({
      db: ctx.db,
      redis: ctx.redis,
      logger,
      makeLog,
    })

    return response.success(`Executed job ${job}. Check logs for more details.`)
  }, {
    beforeHandle: requireApiSecret,
    detail: { tags: ['Internal'], description: 'Execute a job' },
  })
  .get(`/job/:job/timing`, async (ctx) => {
    const { job } = ctx.params
    console.log(job)
    if (!isValidJob(job)) return response.error(`Invalid job name, valid names are: ${jobs.join(', ')}`)

    return response.success(`Job ${job} is scheduled to run every ${timings[job]}ms`)
  }, {
    beforeHandle: requireApiSecret,
    detail: { tags: ['Internal'], description: 'Execute a job' },
  })
