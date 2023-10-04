import { Redis } from '@upstash/redis/nodejs';

export const availableFoods = ['carrot', 'chorus_fruit', 'wheat'] as const;
export type AvailableFood = (typeof availableFoods)[number];

export const rarities = [
  'COMMON',
  'UNCOMMON',
  'EPIC',
  'MYTHICAL',
  'LEGENDARY'
] as const;
export type Rarity = (typeof rarities)[number];

export type RarityOverwrite = Omit<Food, 'rarityOverwrites'>;

export type Food = {
  baseChance: number;
  price: number;
  rarityOverwrites: Record<Rarity, RarityOverwrite[]>;
};

export const redis = Redis.fromEnv();

export async function getAllFoodItems(
  match = '_food-*'
): Promise<Record<AvailableFood, Food>> {
  let cursor = 0;
  const foodItems = {};

  do {
    const result = await redis.scan(cursor, { match });

    cursor = result[0];
    const keys = result[1];

    if (keys.length > 0) {
      const foods = await redis.json.mget(keys, '$');
      for (let i = 0; i < foods.length; i++) {
        const food: Food = foods[i][0];
        const key = keys[i]!;
        const foodName = key.slice(match.length - 1);
        (foodItems as any)[foodName] = food;
      }
    }
  } while (cursor !== 0);

  console.log(foodItems);

  return foodItems as any;
}

// TODO add ratelimiting - @upstash/ratelimit
