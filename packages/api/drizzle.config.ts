import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv';

config()

// export default {
//   schema: './src/db/schema/',
//   driver: 'pg',
//   dbCredentials: {
//     connectionString: config.env.DATABASE_URL,
//   },
// } satisfies Config

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/',
  out: '.drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
