import { relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  json,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { createId } from '@paralleldrive/cuid2'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { type PetUpgrade, availablePets } from 'shared'
import { users } from '.'

export const petsTable = pgTable('pets', {
  uuid: text('uuid').primaryKey().$defaultFn(createId),
  ownerId: text('owner_id').notNull(),

  displayName: text('display_name').notNull().unique(),
  type: text('type', {
    enum: availablePets,
  }).notNull(),

  level: integer('level').notNull().default(1),

  upgradeSlots: json('upgrade_slots')
    .$type<PetUpgrade[]>()
    .notNull()
    .default([]),

  boughtSlot: boolean('bought_slot').notNull().default(false),

  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

export const petRelations = relations(petsTable, ({ one }) => ({
  owner: one(users, {
    fields: [petsTable.ownerId],
    references: [users.id],
  }),
}))

export type PetSelect = typeof petsTable.$inferSelect
export type PetInsert = typeof petsTable.$inferInsert

// If you're getting a [Kind] typebox error, try reinstalling the dependencies. Sometimes because elysia re-exports typebox it fucks up the actual typebox types for some reason :despairge:
export const selectPetSchema = createSelectSchema(petsTable)
export const insertPetSchema = createInsertSchema(petsTable)
