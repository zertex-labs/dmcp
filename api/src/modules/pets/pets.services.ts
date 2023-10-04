import type { InferInsertModel } from 'drizzle-orm';

import { db, tables } from '../../lib/drizzle';

export const createPet = (petInfo: InferInsertModel<typeof tables.pets>) =>
  db.insert(tables.pets).values(petInfo).returning();

export const getOwnedPets = (ownerId: string, includeOwner = false) =>
  db.query.pets.findMany({
    where: (pets, { eq }) => eq(pets.ownerId, ownerId),
    with: includeOwner
      ? {
          owner: true
        }
      : {}
  });
