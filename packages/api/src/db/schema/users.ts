import { relations } from 'drizzle-orm'
import { customType, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { pets } from '.'

const currency = customType<{ data: number }>({
  dataType() {
    return 'decimal(15, 2)'
  },
  fromDriver(value) {
    return Number(value)
  },
})

export const userTable = pgTable('user', {
  id: text('id').primaryKey(), // discord snowflake

  balance: currency('balance', {
    precision: 11,
    scale: 2,
  }).default(0).notNull(),

  activePetId: text('active_pet_id').references(() => pets.uuid),

  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})

export const userRelations = relations(userTable, ({ many, one }) => ({
  pets: many(pets),
  activePet: one(pets, {
    fields: [userTable.activePetId],
    references: [pets.uuid],
  }),
}))

export type UserSelect = typeof userTable.$inferSelect
export type UserInsert = typeof userTable.$inferInsert

// If you're getting a [Kind] typebox error, try reinstalling the dependencies. Sometimes because elysia re-exports typebox it fucks up the actual typebox types for some reason :despairge:
export const selectUserSchema = createSelectSchema(userTable)
export const insertUserSchema = createInsertSchema(userTable)
