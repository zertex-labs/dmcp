import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from '.';
import { ALL_PETS } from '../../constants';

export const petsTable = pgTable('pets', {
  uuid: uuid('uuid').primaryKey().defaultRandom(),
  ownerId: text('owner_id'),

  displayName: text('display_name').notNull().unique(),
  type: text('type', {
    enum: ALL_PETS
  }).notNull()
});

type DrizzleWtfIsThis = any;
export const petRelations = relations(petsTable, ({ one }) => ({
  owner: one(users, {
    fields: [petsTable.ownerId],
    references: [users.id]
  })
}));
