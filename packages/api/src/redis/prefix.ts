export const PREFIXES = Object.freeze({
  farmingUser: 'user:farming:',
  dbUser: 'user:db:',
  pet: 'pet:',
})

export type PrefixKey = keyof typeof PREFIXES

export function createRedisKey<
  PKey extends PrefixKey,
>(prefixKey: PKey, value: string) {
  return `${PREFIXES[prefixKey]}${value}`
}

export function getPrefix(value: string) {
  return Object.values(PREFIXES).find(prefix => value.startsWith(prefix))
}

export function getPrefixKey(value: string) {
  const prefix = getPrefix(value)
  if (!prefix) return

  return value.slice(prefix.length) as PrefixKey
}
