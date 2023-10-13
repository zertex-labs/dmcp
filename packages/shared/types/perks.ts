import type { PlayerStat } from './stats'

export const availablePerks = ['PERK_SPEED', 'PERK_FARMING'] as const
export type AvailablePerk = (typeof availablePerks)[number]

export interface PerkType {
  baseValue: number
  maxValue: number
  appliesTo: PlayerStat[]
}
