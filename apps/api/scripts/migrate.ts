// migrate.ts
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import db from '../src/db';

(async () => {
  try {
    await migrate(db, { migrationsFolder: '.drizzle' });
    console.log('Migration complete');
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
})()
