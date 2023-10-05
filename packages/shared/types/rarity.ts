import type { Food } from ".";

export const rarities = [
  "COMMON",
  "UNCOMMON",
  "EPIC",
  "MYTHICAL",
  "LEGENDARY",
] as const;
export type Rarity = (typeof rarities)[number];

export type RarityOverwrite = Omit<Food, "rarityOverwrites">;
