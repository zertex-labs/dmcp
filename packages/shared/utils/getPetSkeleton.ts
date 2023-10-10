import { pets } from '../data';

import type { Pet, PetSkeleton } from 'types';

export function getPetSkeleton(petOrType: Pet | Pet['type']) {
  return pets[
    typeof petOrType == 'object' ? petOrType.type : petOrType
  ] as PetSkeleton;
}

export default getPetSkeleton;
