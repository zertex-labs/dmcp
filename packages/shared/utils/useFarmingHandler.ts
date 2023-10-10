import type {
  AvailablePerk,
  AvailableFood,
  User,
  PlayerStat,
  PerkType,
  Rarity,
  Pet,
  PetSkeleton,
  Food
} from '../types';

import { createBaseStats, createBaseChances } from '../types';
import { perks as dataPerks, upgrades, food as dataFood } from '../data';
import { getPetSkeleton, randomNumber } from '.';

type FoodResponse = {
  item: AvailableFood;
  amount: number;
};

type FarmingResponse = {
  farmed: FoodResponse[];
  total: number;
};

type NamedFood = Food & { name: AvailableFood };
type NamedFoodWithChanced = NamedFood & { chance: number };

type CalculatedPlayerStats = Record<PlayerStat, number>;

function calculateUserStats(
  pet: Pet & PetSkeleton,
  base: CalculatedPlayerStats
): CalculatedPlayerStats {
  const finalChances = createBaseChances();

  const { type, level, upgradeSlots, perks: perkNames, maxLevel } = pet;
  // const { perks: perkNames, maxLevel } = pet.skeleton;

  // get the actual perk objects from the perk names
  const perks = perkNames.map(
    (name) => dataPerks.data[name as AvailablePerk] as PerkType
  );

  // apply perks to chances
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
    Object.entries(upgrade.appliesTo).forEach(([stat, value]) => {
      finalChances[stat as PlayerStat] += value;
    });
  });

  // apply chances
  Object.entries(finalChances).forEach(([_stat, percentageToIncrease]) => {
    if (percentageToIncrease == 0) return;

    const stat = _stat as PlayerStat;
    const oldValue = base[stat];
    const toIncrease = oldValue * percentageToIncrease;
    (base[stat] += toIncrease).toFixed(3);
  });

  return base;
}

function calculateChances(food: NamedFood[]): NamedFoodWithChanced[] {
  const probabilityTotalAmount = food.reduce((acc, cur) => {
    acc += cur.probability;
    return acc;
  }, 0);

  const chancePerItem = 1 / probabilityTotalAmount;

  const probabilityChances = food.map((food) => {
    return {
      ...food,
      chance: food.probability * chancePerItem
    };
  });

  return probabilityChances;
}

const parseFoodBasedOnProbability = (): {
  guaranteed: NamedFood[];
  other: NamedFood[];
} => {
  const guaranteed: NamedFood[] = [];
  const other: NamedFood[] = [];

  Object.entries(dataFood).forEach(([name, food]) => {
    if (typeof food == 'string') return;

    const e = food.probability === 0 ? guaranteed : other;
    e.push({ ...(food as Food), name: name as AvailableFood });
  });

  return {
    guaranteed,
    other
  };
};

function parseAllFoodItemsWithChances() {
  const probabilityBased = parseFoodBasedOnProbability();
  const withChances = calculateChances(probabilityBased.other);
  withChances.push(
    ...probabilityBased.guaranteed.map((x) => ({ ...x, chance: -1 }))
  );

  return withChances;
}

function doFarm({
  rarity,
  stats,
  allItems
}: {
  stats: CalculatedPlayerStats;
  rarity: Rarity;
  allItems: ReturnType<typeof parseAllFoodItemsWithChances>;
}) {
  const roll = Math.random();
  const finalItems = allItems.filter((food) => {
    const invertedChance = 1 - food.chance;
    if (food.chance == -1 || roll > invertedChance) {
      return true;
    }
  });

  const withAmounts = finalItems.map((food) => {
    const amount = randomNumber(1, food.maxItems);
    return {
      ...food,
      amount
    };
  });

  return withAmounts;
}

let store: ReturnType<typeof _createFarmingManager>;

export function useFarmingHandler() {
  if (!store) store = _createFarmingManager();
  return store;
}

const _createFarmingManager = () => {
  const cache = new Map<string, FarmingResponse>();
  const allItems = parseAllFoodItemsWithChances();

  function farm(user: User) {
    let stats = createBaseStats();
    let rarity: Rarity = 'COMMON';

    if (user.activePet) {
      const skeleton = getPetSkeleton(user.activePet);
      rarity = skeleton.rarity;
      stats = calculateUserStats({ ...user.activePet, ...skeleton }, stats);
    }

    const farm = doFarm({ stats, rarity, allItems });

    return farm;
  }

  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: any) => cache.set(key, value),
    farm
  };
};
