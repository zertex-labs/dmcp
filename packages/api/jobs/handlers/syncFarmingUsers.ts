import type { FarmingUser, MadeLog } from 'shared'
import { createRedisKey } from '../../src/redis'
import { error, useFarmingUsersBatcher } from '../../src/utils'
import type { Args as HandlerArgs, JobHandler } from '../schedule'
import type { Job } from '..'

const batcher = useFarmingUsersBatcher()

async function syncUser(redis: HandlerArgs['redis'], user: FarmingUser, log: MadeLog): Promise<{ ok: boolean }> {
  try {
    const key = createRedisKey('farmingUser', user.id)
    const jsonRes = await redis.json.set(key, '$', user)
    const ok = !!jsonRes && jsonRes === 'OK'

    if (ok && !batcher.remove(user))
      log(`Failed to remove user ${user.id} from batcher`, 'error')

    return { ok }
  }
  catch (err: any) {
    error(err, `Failed to sync user ${user.id}`)
    return { ok: false }
  }
}

export default (async ({ redis, makeLog }) => {
  const allUsers = batcher.all()
  const log = makeLog<(Job & string) | {}>('syncFarmingUsers', {
    date: 'bgRed',
  })

  if (allUsers.length === 0) {
    log('No users to sync', 'warn')
    return
  }

  const res = await Promise.all(allUsers.map(user => syncUser(redis, user, log)))

  const failed: FarmingUser[] = []
  res.forEach((r, i) => {
    if (!r.ok) failed.push(allUsers[i]!)
  })

  if (failed.length > 0)
    batcher.createOrUpdateMultiple(failed)

  log(`Synced ${allUsers.length - failed.length}/${allUsers.length} users`)

  const after = batcher.all()
  if (after.length !== 0) log(`Batcher has leftover users.\n${JSON.stringify(after)}`, 'error')
}) satisfies JobHandler
