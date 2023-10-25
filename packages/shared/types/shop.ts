import type { AvailablePet, PetUpgrade, Rarity } from '.'

export const shopItemTypes = ['pet', 'upgrade'] as const
export type ShopItemType = typeof shopItemTypes[number]

export type ShopItem = ({
  type: 'pet'
  key: AvailablePet
  rarity: Rarity
} | {
  type: 'upgrade'
  key: PetUpgrade
}) & {
  price: number

  // TODO maybe max amount. But then we need to add a "shopDate" to each upgrade/pet so we can track if it's been bought from the current shop
}

export interface Shop {
  items: ShopItem[]
  generatedAt: string // ISO date string
}
