import 'dotenv/config';

/** @type { import("drizzle-kit").Config } */
export default {
  schema: './src/lib/drizzle/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.NEON_DATABASE_URL
  }
};
