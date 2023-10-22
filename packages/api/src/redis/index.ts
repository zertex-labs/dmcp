import { Redis } from '@upstash/redis/nodejs'

export const redis = Redis.fromEnv()

export * from './getAllItems'
export * from './prefix'
