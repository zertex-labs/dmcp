import type { Rarity, RarityOverwrite } from '.';

export const availableFoods = ['CARROT', 'CHORUS_FRUIT', 'WHEAT', "SUGAR_CANE"] as const;
export type AvailableFood = (typeof availableFoods)[number];

export type Food = {
  probability: number;
  price: number;
  maxItems: number;
  rarityOverwrites: Record<Rarity, RarityOverwrite[]>;
};
