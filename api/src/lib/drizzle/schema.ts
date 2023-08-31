import { pgTable, text } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const test = pgTable('test', {
  // This value does not affect the drizzle-kit behavior, it is only used at runtime in drizzle-orm
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey()
});
