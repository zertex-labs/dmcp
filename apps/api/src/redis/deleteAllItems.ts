import { error } from '../utils'
import type { PrefixKey } from '.'
import { createRedisKey, redis } from '.'

export async function deleteAllItems(
  o: string | { key: PrefixKey; value: string; suffix?: string },
  withSuffix = true,
): Promise<boolean> {
  let match: string
  if (typeof o === 'string')
    match = o
  else
    match = createRedisKey(o.key, o.value, o.suffix)

  let cursor = 0

  if (withSuffix) match += '*'

  try {
    do {
      const result = await redis.scan(cursor, { match })

      cursor = result[0]
      const keys = result[1]

      if (keys.length > 0)
        await redis.del(...keys)
    } while (cursor !== 0)
  }
  catch (e: any) {
    error(e, `Failed to delete all items ${match}`)
    return false
  }

  return true
}
