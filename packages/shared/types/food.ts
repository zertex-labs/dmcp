import type { Rarity, RarityOverwrite } from '.'

export const availableFoods = [
  'CARROT',
  'CHORUS_FRUIT',
  'WHEAT',
  'SUGAR_CANE',
] as const
export type AvailableFood = (typeof availableFoods)[number]

export interface Food {
  probability: number
  price: number
  maxItems: number
  weight: number
  rarityOverwrites: Record<Rarity, RarityOverwrite[]>
}
