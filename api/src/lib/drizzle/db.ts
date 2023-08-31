import { drizzle } from 'drizzle-orm/better-sqlite3';
import { Client } from 'pg';

const pgClient = new Client({
  connectionString: process.env.NEON_DATABASE_URL
});

await pgClient.connect();

export const db = drizzle(pgClient);

export default db;
