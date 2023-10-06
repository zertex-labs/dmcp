export type MaybePromise<T> = T | Promise<T>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Nullable<T> = T | null | undefined;

export * from './rarity';
export * from './food';
export * from './perks';
export * from './pet';
export * from './user';
export * from './stats';
