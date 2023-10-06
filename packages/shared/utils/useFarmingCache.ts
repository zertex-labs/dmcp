import {
  AvailablePerk,
  AvailableFood,
  User,
  playerStats,
  createBaseStats,
  createBaseChances,
  PlayerStat,
  PerkType
} from '../types';
import createSingleton from './createSingleton';
import { pets, perks as dataPerks, upgrades } from '../data';

type FoodResponse = {
  item: AvailableFood;
  amount: number;
};

type FarmingResponse = {
  farmed: FoodResponse[];
  total: number;
};

const calculateBonuses = (user: User) => {
  const stats = createBaseStats();
  const finalChances = createBaseChances();

  if (user.activePet) {
    const { type, level, upgradeSlots } = user.activePet;
    const { perks: perkNames, maxLevel } = pets[type];

    // apply perks to chances
    const perks = perkNames.map(
      (name) => dataPerks.data[name as AvailablePerk] as PerkType
    );

    perks.forEach((perk) => {
      const { appliesTo, baseValue, maxValue } = perk;
      const perLevel = (maxValue - baseValue) / maxLevel;

      appliesTo.forEach((stat) => {
        finalChances[stat] += baseValue + perLevel * level;
      });
    });

    // apply upgrade slots to chances
    upgradeSlots.forEach((upgradeSlot) => {
      const upgrade = upgrades[upgradeSlot];
      console.log(upgrades, upgradeSlot)
      Object.entries(upgrade.appliesTo).forEach(([stat, value]) => {
        finalChances[stat as PlayerStat] += value;
      })
    })

    console.log(upgradeSlots)
  }

  console.log(finalChances);

  // apply chances
  Object.entries(finalChances).forEach(([_stat, percentageToIncrease]) => {
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
