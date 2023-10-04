import { json, pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from '.';
import { ALL_PETS } from '../../constants';
import { time } from 'drizzle-orm/mysql-core';

const UPGRADES = ['STAT_UP_FARMING', 'STAT_DOWN_LESHTA'] as const;

type Upgrade = {
  type: typeof UPGRADES[number];
  value: number;
}

export const petsTable = pgTable('pets', {
  uuid: uuid('uuid').primaryKey().defaultRandom(),
  ownerId: text('owner_id'),

  displayName: text('display_name').notNull().unique(),
  type: text('type', {
    enum: ALL_PETS
  }).notNull(),
  bonuses: json('bonuses').$type<Upgrade[]>().default([]),

  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow()
});

type DrizzleWtfIsThis = any;
export const petRelations = relations(petsTable, ({ one }) => ({
  owner: one(users, {
    fields: [petsTable.ownerId],
    references: [users.id]
  })
}));
