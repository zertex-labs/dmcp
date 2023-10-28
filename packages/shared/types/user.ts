import type { Crop, Nullable, Pet } from '.'

export interface User {
  id: string
  createdAt: string
  updatedAt: string
  activePetId: Nullable<string>
  balance: number

  pets?: Pet[]
  activePet?: Nullable<Pet>
}

export type FarmingUser = Pick<User, 'id'> & {
  total: number
  individual: Record<Crop, number>
  totalWeight: number
}
