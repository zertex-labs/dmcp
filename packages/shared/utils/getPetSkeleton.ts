import type { Pet, PetSkeleton } from 'types'

export function getPetSkeleton(pets: Record<string, PetSkeleton>, petOrType: Pet | Pet['type']) {
  return pets[
    typeof petOrType == 'object' ? petOrType.type : petOrType
  ] as PetSkeleton
}

export default getPetSkeleton
