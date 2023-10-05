import type { Rarity, RarityOverwrite } from '.';

export const availableFoods = ['carrot', 'chorus_fruit', 'wheat'] as const;
export type AvailableFood = (typeof availableFoods)[number];

export type Food = {
  baseChance: number;
  price: number;
  rarityOverwrites: Record<Rarity, RarityOverwrite[]>;
};
