export type MaybePromise<T> = T | Promise<T>

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export * from './discord'
export * from './event'
export * from './pets'
