import { Elysia } from "elysia";
import { db } from "../db";
import { redis } from "../redis";
import { getAllFoodItems, getAllPets } from "../redis/";

export const ctx = new Elysia({
  name: "@app/ctx",
})
  .decorate("db", db)
  .decorate("redis", redis)
  .state("food", await getAllFoodItems())
  .state("pets", await getAllPets())
