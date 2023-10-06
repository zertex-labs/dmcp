import type { AvailablePerk, Rarity, User } from '.';

export const availablePets = ['COW', 'FOX'] as const;
export type AvailablePet = (typeof availablePets)[number];

export type PetSkeleton = {
  rarity: Rarity;
  bonuses: Record<
    AvailablePerk,
    {
      base: number;
      max: number;
    }
  >;
};

export type Pet = {
  uuid: string;
  ownerId: string;

  displayName: string;
  type: AvailablePet;

  level: number;

  upgradeSlots: AvailablePerk[];
  boughtSlot: boolean;

  createdAt: string;
  updatedAt: string;
};

export type PetWithOwner = Pet & {
  owner: User;
};
