export type PlayerPossibleStats = 'farmingFortune' | 'speed'; 

export type PlayerStats = Record<PlayerPossibleStats, number>;

export const BASE_PLAYER_STATS = Object.freeze({
  farmingFortune: 1,
  speed: 1
} satisfies PlayerStats);