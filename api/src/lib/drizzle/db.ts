import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from './schema';

const pgClient = new pg.Client({
  connectionString: process.env.NEON_DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  }
});

await pgClient.connect();

export const db = drizzle(pgClient, {
  schema
});

export default db;