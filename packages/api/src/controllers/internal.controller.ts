import { Elysia, t } from 'elysia'
import { ctx } from '../context'
import { requireApiSecret, response } from '../utils'
import { jobs } from '../../jobs'
import { isValidJob, logger, makeLog } from '../../jobs/schedule'
import { jobHandlers, timings } from '../timings'
import { app } from '..'
import { config } from '../config'

export const internalController = new Elysia({
  prefix: '/internal',
  name: 'api:internal',
},
)
  .use(ctx)
  .get('/ping', () => 'Pong', {
    detail: { tags: ['Internal'], description: 'Ping the API' },
  })
  .post('/job/:job/invoke', async (ctx) => {
    const { job } = ctx.params
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
  .post('/stop', (ctx) => {
    if (ctx.body.stopKey !== config.env.STOP_KEY) return response.predefined.notFound // ik wrong status code but don't wanna return actual meaningful errors here
    app.stop()

    return response.success('Forcefully stopping API. Check console for more details.')
  }, {
    beforeHandle: requireApiSecret,
    body: t.Object({
      stopKey: t.String(),
    }),
    detail: { tags: ['Internal'], description: 'Stop the API' },
  })
  .get('/job/timings', () => response.success(Object.entries(timings).reduce((acc, [job, timing]) => ({ ...acc, [job]: timing }), {})), {
    beforeHandle: requireApiSecret,
    detail: { tags: ['Internal'], description: 'Get all the job itmings' },
  })
  .get('/job/:job/timing', async (ctx) => {
    const { job } = ctx.params
    if (!isValidJob(job)) return response.error(`Invalid job name, valid names are: ${jobs.join(', ')}`)

    return response.success(`Job ${job} is scheduled to run every ${timings[job]}ms`)
  }, {
    beforeHandle: requireApiSecret,
    detail: { tags: ['Internal'], description: 'Get the timing of a certain job' },
  })
