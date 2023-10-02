import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const ALL_PETS = ['FOX', 'CAT', 'DOG', 'PANDA'] as const;
export type PetType = (typeof ALL_PETS)[number];

export const PETS = ALL_PETS.reduce(
  (acc, pet) => {
    acc[pet] = pet;
    return acc;
  },
  {} as Record<PetType, PetType>
);

export const petsTable = pgTable('pets', {
  uuid: uuid('uuid').primaryKey().defaultRandom(),
  owner: text('owner').notNull(), // discord user id

  displayName: text('display_name').notNull().default('Unnamed Pet'),
  type: text('type', {
    enum: ALL_PETS
  }).notNull(),
  maxCount: integer('max_count').notNull().default(3)
});
