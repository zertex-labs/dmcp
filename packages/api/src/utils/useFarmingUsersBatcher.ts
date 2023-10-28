import type { FarmingUser } from 'shared'

let store: ReturnType<typeof makeStore>

export function useFarmingUsersBatcher() {
  if (!store) store = makeStore()
  return store
}

export type SyncableFarmingUser = FarmingUser & {
/** If set to true user won't be synced with redis on the sync job, just removed from batcher (default: false)  */
  onlyMemory?: boolean
}

/**
 * Used to store farmingUsers in memory for a short period of time (determined by the timing of the syncFarmingUsers job)
 *
 * If a user has shouldSync set to true, it will be synced to redis
 * If not, it will be removed from the batcher on the next syncFarmingUsers job
 */
export function makeStore() {
  // discordId -> FarmingUser(with shouldSync, used in syncFarmingUsers job)
  const batches = new Map<string, SyncableFarmingUser>()

  function createOrUpdate(user: SyncableFarmingUser) {
    batches.set(user.id, user)
  }

  function remove(idxOrUser: FarmingUser | string) {
    const id = typeof idxOrUser === 'string' ? idxOrUser : idxOrUser.id
    return batches.delete(id)
  }

  return {
    createOrUpdate,
    createOrUpdateMultiple: (users: SyncableFarmingUser[]) => {
      users.forEach(createOrUpdate)
    },

    remove,
    removeMultiple: (idxOrUsers: (FarmingUser | string)[]) => {
      idxOrUsers.forEach(remove)
    },

    get: (id: string) => {
      return batches.get(id)
    },

    all: () => {
      return Array.from(batches.values())
    },

    flush: () => {
      batches.clear()
    },

    get _batches() {
      return batches
    },
  }
}
