import type { FarmingUser } from 'shared'

let store: ReturnType<typeof makeStore>

export function useFarmingUsersBatcher() {
  if (!store) store = makeStore()
  return store
}

export function makeStore() {
  // discordId -> FarmingUser
  const batches = new Map<string, FarmingUser>()

  function createOrUpdate(user: FarmingUser) {
    batches.set(user.id, user)
  }

  function createOrUpdateMultiple(users: FarmingUser[]) {
    users.forEach(createOrUpdate)
  }

  function all() {
    return Array.from(batches.values())
  }

  function remove(user: FarmingUser) {
    return batches.delete(user.id)
  }

  function get(id: string) {
    return batches.get(id)
  }

  return {
    createOrUpdate,
    createOrUpdateMultiple,
    remove,
    get,
    all,
    get _batches() {
      return batches
    },
  }
}
