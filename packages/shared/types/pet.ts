import type { AvailablePerk, PetUpgrade, Rarity, User } from '.'

export const availablePets = ['COW', 'FOX'] as const
export type AvailablePet = (typeof availablePets)[number]

export interface PetSkeleton {
  rarity: Rarity
  maxLevel: number
  perks: AvailablePerk[]
}

export interface Pet {
  uuid: string
  ownerId: string

  displayName: string
  type: AvailablePet

  level: number

  upgradeSlots: PetUpgrade[]
  boughtSlot: boolean

  createdAt: string
  updatedAt: string
}

export type PetWithOwner = Pet & {
  owner: User
}
