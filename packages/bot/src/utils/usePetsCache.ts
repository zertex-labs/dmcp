import { Pet, createSingleton } from 'shared';

export const usePetsCache = createSingleton(() => {
  const cache = new Map<string, Pet[]>(); // userId -> pets

  return {
    get: (userId: string) => {
      return cache.get(userId);
    },
    set: (userId: string, pets: Pet[]) => {
      cache.set(userId, pets);
    },
    remove: (userId: string) => {
      cache.delete(userId);
    },
    flush: () => {
      cache.clear();
    },
    get cache() {
      return cache;
    }
  };
});

export default usePetsCache;
