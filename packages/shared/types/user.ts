import type { AvailableFood, Nullable, Pet } from '.'

export interface User {
  id: string
  createdAt: string
  updatedAt: string

  pets?: Pet[]
  activePet?: Nullable<Pet>
}

export type FarmingUser = Pick<User, 'id'> & {
  username: string

  total: number
  individual: Record<AvailableFood, number>
}
