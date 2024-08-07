import type { PrefixKey } from '.'
import { createRedisKey, redis } from '.'

export async function getAllItems<Keys extends PropertyKey, Stored>(
  o: string | { key: PrefixKey; value?: string; suffix?: string },
): Promise<Record<Keys, Stored>> {
  let cursor = 0
  const out = {} as any

  let match: string
  if (typeof o === 'string')
    match = o
  else
    match = createRedisKey(o.key, o?.value ?? '*', o.suffix)

  console.log(match)

  do {
    const result = await redis.scan(cursor, { match })

    cursor = Number(result[0])
    const keys = result[1]

    console.log(keys)

    if (keys.length > 0) {
      const items = await redis.json.mget(keys, '$')
      for (let i = 0; i < items.length; i++) {
        const item = items[i][0]
        const key = keys[i]!
        const itemName = key.slice(match.length - 1)
        console.log(itemName)
        out[itemName] = item
      }
    }
  } while (cursor !== 0)

  console.log('out',out)

  return out
}
