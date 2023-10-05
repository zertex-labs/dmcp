import type { AvailablePet, User } from '../src/types';

type FarmingCache = ReturnType<typeof __makeStore>;

let store: FarmingCache;
export function useFarmingCache(): FarmingCache {
  if (!store) store = __makeStore();

  return store;
}

function __makeStore() {
  const cache = new Map<string, any>();

  function getPetBonuses(petType: AvailablePet) {
    return;
  }

  function farm(user: User) {}

  return {
    get cache() {
      return cache;
    }
  };
}
