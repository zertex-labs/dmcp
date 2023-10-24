import type { FarmingUser } from 'shared'
import { log, useFarmingUsersBatcher } from '../../src/utils'
import type { Args as HandlerArgs, JobHandler } from '../schedule'
import { createRedisKey } from '../../src/redis'

const batcher = useFarmingUsersBatcher()

async function syncUser(redis: HandlerArgs['redis'], user: FarmingUser): Promise<{ ok: boolean }> {
  try {
    const key = createRedisKey('farmingUser', user.id)
    const jsonRes = await redis.json.set(key, '$', user)
    const ok = !!jsonRes && jsonRes === 'OK'

    if (ok && !batcher.remove(user))
      log(`Failed to remove user ${user.id} from batcher`, 'red')

    return { ok }
  }
  catch (err) {
    log(`Failed to sync user ${user.id}: ${err}`, 'red')
    return { ok: false }
  }
}

export default (async ({ redis }) => {
  const allUsers = batcher.all()
  if (allUsers.length === 0) {
    log('No users to sync', 'yellow')
    return
  }

  const res = await Promise.all(allUsers.map(user => syncUser(redis, user)))

  const failed: FarmingUser[] = []
  res.forEach((r, i) => {
    if (!r.ok) failed.push(allUsers[i]!)
  })

  if (failed.length > 0)
    batcher.createOrUpdateMultiple(failed)

  log(`Synced ${allUsers.length - failed.length}/${allUsers.length} users`, 'yellow')

  const after = batcher.all()
  if (after.length !== 0) log(`Batcher has leftover users.\n${JSON.stringify(after)}`, 'red')
}) satisfies JobHandler
