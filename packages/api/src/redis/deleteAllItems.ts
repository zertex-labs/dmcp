import type { PrefixKey } from '.'
import { PREFIXES, createRedisKey, redis } from '.'

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

      if (keys.length > 0) {
        console.log(`deleting, ${keys}`)
        await redis.del(...keys)
      }
    } while (cursor !== 0)
  }
  catch (e) {
    console.error(e)
    return false
  }

  return true
}
