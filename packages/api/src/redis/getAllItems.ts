import type { PrefixKey } from '.'
import { PREFIXES, createRedisKey, redis } from '.'

// type Args = <T extends string | PrefixKey>(prefix: T) => T extends string ? [T] : [T, string]
// type Args<PrefixType extends (string | PrefixKey) & ({})> = PrefixType extends string ? [PrefixType] : [PrefixType, string]

// if prefix is a string args should be just a string
// if it's PrefixKey there's should a value:string arg as well
export async function getAllItems<Keys extends PropertyKey, Stored>(
  o: string | { key: PrefixKey; value: string; suffix?: string },
): Promise<Record<Keys, Stored>> {
  let cursor = 0
  const items = {}

  let match: string
  if (typeof o === 'string')
    match = o
  else
    match = createRedisKey(o.key, o.value, o.suffix)

  do {
    const result = await redis.scan(cursor, { match })

    cursor = result[0]
    const keys = result[1]

    if (keys.length > 0) {
      const items = await redis.json.mget(keys, '$')
      for (let i = 0; i < items.length; i++) {
        const item = items[i][0]
        const key = keys[i]!
        const itemName = key.slice(match.length - 1)
          ; (items as any)[itemName] = item
      }
    }
  } while (cursor !== 0)

  return items as any
}
