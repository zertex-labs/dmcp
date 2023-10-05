export const createSingleton = <T>(fn: () => T) => {
  let instance: T | null = null;

  return () => {
    if (!instance) {
      instance = fn();
    }

    return Object.freeze(instance);
  };
};

export const useFarmingCache = createSingleton(() => {
  const cache = new Map<string, any>();

  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: any) => cache.set(key, value)
  };
});
