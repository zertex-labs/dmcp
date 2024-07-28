import { Redis } from '@upstash/redis'

export const redis = Redis.fromEnv()

export * from './getAllItems'
export * from './prefix'
