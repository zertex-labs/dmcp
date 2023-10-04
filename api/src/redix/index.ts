import { Redis } from "@upstash/redis/nodejs";

export const redis = Redis.fromEnv();