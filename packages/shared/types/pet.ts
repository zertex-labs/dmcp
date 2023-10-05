import type { AvailableBonus, Rarity } from ".";

export const availablePets = ["COW", "FOX"] as const;
export type AvailablePet = (typeof availablePets)[number];

export type Pet = {
  rarity: Rarity;
  bonuses: Record<
    AvailableBonus,
    {
      base: number;
      max: number;
    }
  >;
};
