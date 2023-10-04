import { t } from "elysia";

export const rarities = [
  "COMMON",
  "UNCOMMON",
  "EPIC",
  "MYTHICAL",
  "LEGENDARY",
] as const;
export type Rarity = (typeof rarities)[number];

export type RarityOverwrite = Omit<Food, "rarityOverwrites">;

export type Food = {
  baseChance: number;
  price: number;
  rarityOverwrites: Record<Rarity, RarityOverwrite[]>;
};

export const StringEnum = <T extends string[]>(values: [...T]) => t.Unsafe<T[number]>({ 
  type: 'string', enum: values 
})

export type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

export const availableBonuses = ["PERK_SPEED", "PERK_FARMING"] as const;
export type AvailableBonus = (typeof availableBonuses)[number];

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
