import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from '.';
import { ALL_PETS } from '../../constants';

export const petsTable = pgTable('pets', {
  uuid: uuid('uuid').primaryKey().defaultRandom(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id), // discord snowflake

  displayName: text('display_name').notNull().default('Unnamed Pet'),
  type: text('type', {
    enum: ALL_PETS
  }).notNull()
});

type DrizzleWtfIsThis = any;
export const petRelations = relations(petsTable, ({ one }) => ({
  owner: one(users, {
    fields: [users.id as DrizzleWtfIsThis],
    references: [petsTable.ownerId as DrizzleWtfIsThis]
  })
}));
