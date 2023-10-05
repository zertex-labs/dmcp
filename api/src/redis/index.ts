import { Redis } from "@upstash/redis/nodejs";

export async function getAllItems<Keys extends PropertyKey, Stored>(
  match: string
): Promise<Record<Keys, Stored>> {
  let cursor = 0;
  const items = {};

  do {
    const result = await redis.scan(cursor, { match });

    cursor = result[0];
    const keys = result[1];

    if (keys.length > 0) {
      const items = await redis.json.mget(keys, "$");
      for (let i = 0; i < items.length; i++) {
        const item = items[i][0];
        const key = keys[i]!;
        const itemName = key.slice(match.length - 1);
        (items as any)[itemName] = item;
      }
    }
  } while (cursor !== 0);

  return items as any;
}

export const redis = Redis.fromEnv();

export * from "./food";
export * from "./pets";

