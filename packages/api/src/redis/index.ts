import { Redis } from '@upstash/redis/nodejs'
import { registerFarmingUpdater, registerLeaderboardUpdater } from '.'

export const redis = Redis.fromEnv()

registerLeaderboardUpdater()
registerFarmingUpdater()

export * from './getAllItems'
export * from './leaderboard'
export * from './users'
