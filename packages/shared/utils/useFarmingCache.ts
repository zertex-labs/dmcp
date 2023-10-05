import {
  AvailableBonus,
  AvailableFood,
  PlayerStats,
  User,
  BASE_PLAYER_STATS,
  PlayerPossibleStats
} from '../types';
import createSingleton from './createSingleton';
import { pets } from '../data';

type FoodResponse = {
  item: AvailableFood;
  amount: number;
};

type FarmingResponse = {
  farmed: FoodResponse[];
  total: number;
};

const upgrades: Record<AvailableBonus, PlayerPossibleStats[]> = {
  PERK_FARMING: ['farmingFortune'],
  PERK_SPEED: ['speed']
};

const calculateBonuses = (user: User): PlayerStats => {
  let stats = { ...BASE_PLAYER_STATS };

  if (user.activePet) {
    const { type, level, upgradeSlots } = user.activePet;
    const { bonuses: baseBonuses } = pets[type];

    const bonuses = Object.values(baseBonuses).map((bonus) => {
      const { baseValue, maxValue } = bonus;
      const bonusValue = baseValue + (level - 1) * maxValue;

      return bonusValue;
    });

    console.log(bonuses);
  }

  return stats;
};

export const useFarmingCache = createSingleton(() => {
  const cache = new Map<string, FarmingResponse>();

  function farm(user: User) {
    calculateBonuses(user);
  }

  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: any) => cache.set(key, value)
  };
});
