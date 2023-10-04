import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { pets } from '.';

export const userTable = pgTable('user', {
  id: text('id').primaryKey(), // discord snowflake

  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow()
});

export const userRelations = relations(userTable, ({ many }) => ({
  pets: many(pets)
}));