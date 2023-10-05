import type { AvailableBonus, Rarity, User } from '.';

export const availablePets = ['COW', 'FOX'] as const;
export type AvailablePet = (typeof availablePets)[number];

export type PetSkeleton = {
  rarity: Rarity;
  bonuses: Record<
    AvailableBonus,
    {
      base: number;
      max: number;
    }
  >;
};

export type Pet = {
  uuid: string;
  type: AvailablePet;
  ownerId: string;
  displayName: string;

  createdAt: string;
  updatedAt: string;
};

export type PetWithOwner = Pet & {
  owner: User;
};
