import type { Rarity, RarityOverwrite } from '.';

export const availableFoods = ['CARROT', 'CHORUS_FRUIT', 'WHEAT'] as const;
export type AvailableFood = (typeof availableFoods)[number];

export type Food = {
  baseChance: number;
  price: number;
  rarityOverwrites: Record<Rarity, RarityOverwrite[]>;
};
