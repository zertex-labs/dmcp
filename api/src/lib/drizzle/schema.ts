import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { ALL_PERMISSIONS } from '../../config/permissions';
import { ALL_ROLES } from '../../config/roles';

export const ALL_PETS = ['FOX', 'CAT', 'DOG', 'PANDA'] as const;
export type PetType = (typeof ALL_PETS)[number];

export const PETS = ALL_PETS.reduce(
  (acc, pet) => {
    acc[pet] = pet;
    return acc;
  },
  {} as Record<PetType, PetType>
);

export const pets = pgTable('pets', {
  uuid: uuid('uuid').primaryKey().defaultRandom(),
  owner: text('owner').notNull(), // discord user id

  displayName: text('display_name').notNull().default('Unnamed Pet'),
  type: text('type', {
    enum: ALL_PETS
  }).notNull(),
  maxCount: integer('max_count').notNull().default(3)
});

export const user = pgTable('user', {
  id: text('id').primaryKey().notNull(), // discord user id
  serverId: text('server_id').notNull(), // discord server id
  role: text('role', {
    enum: ALL_ROLES
  }).default('DEFAULT'),
  permissions: text('permissions', {
    enum: ALL_PERMISSIONS
  })
    .array()
    .notNull()
});
