export type MaybePromise<T> = T | Promise<T>

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {} // eslint-ignore-next-line

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift'
export type FixedLengthArray<
  T,
  L extends number,
  TObj = [T, ...Array<T>],
> = Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>> & {
  readonly length: L
  [I: number]: T
  [Symbol.iterator]: () => IterableIterator<T>
}

export type NonEmptyArr<T> = [T, ...T[]]

export type Nullable<T> = T | null | undefined

export type AlwaysExist<T> = T extends undefined | null ? never : T

export type KeysOf<T> = T extends Record<infer K, any> ? K : never

export type ServiceResponse<DataType, ErrorType = string> = {
  status: 'success'
  data: DataType
} | {
  status: 'error'
  error: ErrorType
  statusCode?: number
}

export * from './rarity'
export * from './food'
export * from './perks'
export * from './pet'
export * from './user'
export * from './stats'
export * from './upgrades'
