import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

const env = createEnv({
  server: {
    DISCORD_BOT_TOKEN: z.string().min(16),
    DISCORD_CLIENT_ID: z.string().min(16),
    GUILD_ID: z.string().refine((val) => {
      try {
        Number.parseInt(val)
        return true
      }
      catch (e) {
        return false
      }
    }),
    API_SECRET: z.string().min(8),
    API_URL: z.string().startsWith('http'),
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
