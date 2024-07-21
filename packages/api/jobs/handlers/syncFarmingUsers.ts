import fs from 'node:fs'
import type { FarmingUser, MadeLog } from 'shared'

import { createRedisKey } from '../../src/redis'
import type { SyncableFarmingUser } from '../../src/utils'
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
  const log = makeLog<(Job & string) | {}>('syncFarmingUsers', {
    date: 'bgRed',
  })

  const all = batcher.all()
  log(`batcher all ${all}`)
  const allUsers: SyncableFarmingUser[] = []
  all.forEach((u) => {
    // if they should sync, add them to allUsers, otherwise remove them from the batcher
    if (u.redisIgnored) batcher.remove(u)
    else allUsers.push(u)
  })

  if (allUsers.length === 0) {
    log('No users to sync, flushing', 'warn')
    batcher.flush()
    return
  }

  // create backup
  const backupDir = './jobs/backups/syncFarmingUsers'
  const backupName = `${allUsers.length}-${Date.now()}.json`
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })
  await Bun.write(`${backupDir}/${backupName}`, JSON.stringify(allUsers))

  const res = await Promise.all(allUsers.map(user => syncUser(redis, user, log)))

  const failed: FarmingUser[] = []
  res.forEach((r, i) => {
    if (!r.ok) failed.push(allUsers[i]!)
  })

  if (failed.length > 0) {
    console.log(`syncFarmingUsers: ${failed.length}/${allUsers.length} users failed to sync; adding failed back in batcher`)
    batcher.createOrUpdateMultiple(failed)
  }
  else {
    console.log(`syncFarmingUsers: all users synced successfully; deleting backup ${backupName}`)
    fs.unlinkSync(`${backupDir}/${backupName}`)
  }

  log(`Synced ${allUsers.length - failed.length}/${allUsers.length} users`)

  const after = batcher.all()
  if (after.length !== 0) log(`Batcher has leftover users.\n${JSON.stringify(after)}`, 'error')
}) satisfies JobHandler
