import { relations } from 'drizzle-orm';
import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { pets } from '.';

export const userTable = pgTable('user', {
  id: text('id').primaryKey() // discord snowflake
});

export const userRelations = relations(userTable, ({ many }) => ({
 pets: many(pets)
}));
