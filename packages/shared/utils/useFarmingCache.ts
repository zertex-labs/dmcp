import {
  AvailablePerk,
  AvailableFood,
  PlayerStat,
  User,
  BASE_PLAYER_STATS,
  PlayerStat,
  playerStats
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

const upgrades: Record<AvailablePerk, PlayerStat[]> = {
  PERK_FARMING: ['farmingFortune'],
  PERK_SPEED: ['speed'],
  COCK: ['speed', 'farmingFortune']
};

const calculateBonuses = (user: User): PlayerStat => {
  let stats = { ...BASE_PLAYER_STATS };

  let upgradeChances = playerStats.reduce(
    (acc, x) => {
      acc[x] = 0;
      return acc;
    },
    {} as Record<PlayerStat, number>
  );

  if (user.activePet) {
    const { type, level, upgradeSlots } = user.activePet;
    const { perks: _uncastPerks } = pets[type];
    const perks = _uncastPerks as AvailablePerk[];

    const bonuses = Object.entries(baseBonuses).map(([_key, bonus]) => {
      const key = _key as AvailablePerk;
      const { baseValue, maxValue } = bonus;
      const perc = baseValue + (level - 1) * maxValue;
      console.log(perc)

      upgrades[key].forEach((t) => (upgradeChances[t] += perc));

      return perc;
    });

    console.log(bonuses, upgradeChances);
  }

  // apply chances
  Object.entries(upgradeChances).forEach(([_stat, percentageToIncrease]) => {
    if (percentageToIncrease == 0) return;

    const stat = _stat as PlayerStat;
    const oldValue = stats[stat];
    const toIncrease = oldValue * percentageToIncrease;
    console.log(stat, oldValue, toIncrease);
    stats[stat] += toIncrease;
  });

  return stats;
};

export const useFarmingCache = createSingleton(() => {
  const cache = new Map<string, FarmingResponse>();

  function farm(user: User) {
    console.log(user);
    return calculateBonuses(user);
  }

  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: any) => cache.set(key, value),
    farm
  };
});
