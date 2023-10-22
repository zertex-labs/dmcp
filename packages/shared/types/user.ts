import type { AvailableFood, Nullable, Pet } from '.'

export interface User {
  id: string
  createdAt: string
  updatedAt: string
  activePetId: Nullable<string>

  pets?: Pet[]
  activePet?: Nullable<Pet>
}

export type FarmingUser = Pick<User, 'id'> & {
  total: number
  individual: Record<AvailableFood, number>
}
