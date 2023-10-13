import type { Pet, PetSkeleton } from 'types'
import { pets } from '../data'

export function getPetSkeleton(petOrType: Pet | Pet['type']) {
  return pets[
    typeof petOrType == 'object' ? petOrType.type : petOrType
  ] as PetSkeleton
}

export default getPetSkeleton
