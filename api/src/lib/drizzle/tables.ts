import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

const test = sqliteTable('test', {
  // This value does not affect the drizzle-kit behavior, it is only used at runtime in drizzle-orm
  id: text('id').$defaultFn(() => createId())
});
