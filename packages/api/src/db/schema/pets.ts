import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { availablePets, type AvailableBonus } from "shared";

import { users } from ".";

export const petsTable = pgTable("pets", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  ownerId: text("owner_id"),

  displayName: text("display_name").notNull().unique(),
  type: text("type", {
    enum: availablePets,
  }).notNull(),

  level: integer("level").notNull().default(1),

  upgradeSlots: json("upgrade_slots")
    .$type<AvailableBonus[]>()
    .notNull()
    .default([]),

  boughtSlot: boolean("bought_slot").notNull().default(false),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const petRelations = relations(petsTable, ({ one }) => ({
  owner: one(users, {
    fields: [petsTable.ownerId],
    references: [users.id],
  }),
}));

