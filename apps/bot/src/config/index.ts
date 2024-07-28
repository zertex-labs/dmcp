import { z } from 'zod'

export const ENV_SCHEMA = z.object({
  DISCORD_BOT_TOKEN: z.string().min(16),
  DISCORD_CLIENT_ID: z.string().min(16),
  GUILD_ID: z.coerce.number().transform((n) => n.toString()),
  API_SECRET: z.string().min(8),
  API_URL: z.string().url(),
});

export const env = ENV_SCHEMA.parse(process.env);

export const config = { env, args: process.argv.slice(2) };
export default config;

