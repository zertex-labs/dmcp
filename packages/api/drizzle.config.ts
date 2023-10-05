import type { Config } from 'drizzle-kit';
import { config } from './src/config';

export default {
  schema: './src/db/schema/',
  driver: 'pg',
  dbCredentials: {
    connectionString: config.env.DATABASE_URL
  }
} satisfies Config;
