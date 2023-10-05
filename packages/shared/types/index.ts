export type MaybePromise<T> = T | Promise<T>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = Nullable<Optional<T>>;

export * from './rarity';
export * from './food';
export * from './bonus';
export * from './pet';
export * from './user';
