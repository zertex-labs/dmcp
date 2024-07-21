import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless';

import { config } from '../config'
import * as schema from './schema'

const pool = new Pool({connectionString: config.env.DATABASE_URL});

export const db = drizzle(pool, {
  schema,
})

export default db
