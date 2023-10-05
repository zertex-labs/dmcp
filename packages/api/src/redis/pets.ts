import type { AvailablePet, PetSkeleton } from 'shared';

import { getAllItems } from '.';

export const getAllPets = () =>
  getAllItems<AvailablePet, PetSkeleton>('_pet-*');
