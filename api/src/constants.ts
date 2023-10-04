export const ALL_PETS = ["FOX", "CAT", "DOG", "PANDA"] as const;
export type PetType = (typeof ALL_PETS)[number];

export const PETS = ALL_PETS.reduce((acc, pet) => {
  acc[pet] = pet;
  return acc;
}, {} as Record<PetType, PetType>);
