import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

import { config } from '../config'
import * as schema from './schema'

export const pgClient = new pg.Client({
  connectionString: config.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

await pgClient.connect()

export const db = drizzle(pgClient, {
  schema,
})

export default db
