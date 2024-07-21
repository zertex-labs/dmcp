import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

const env = createEnv({
  server: {
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    WS_ACCESS_TOKEN: z.string().min(8),
    API_SECRET: z.string().min(8),
    STOP_KEY: z.string().min(32),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(8),
    DISCORD_BOT_SECRET: z.string().min(8),
    DATABASE_URL: z.string(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  },
  runtimeEnv: process.env,
})

const args = {
  // watch: process.argv.includes("--watch"),
  // liveReload: true,
}

export const config = {
  env,
  args,
}
