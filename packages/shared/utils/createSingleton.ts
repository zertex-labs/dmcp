export const createSingleton = <T>(fn: () => T) => {
  let instance: T | null = null;

  return () => {
    if (!instance) {
      instance = fn();
    }

    return Object.freeze(instance);
  };
};

export default createSingleton;
