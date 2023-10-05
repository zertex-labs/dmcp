import { getAllItems } from ".";
import { Food } from "../types";

export const availableFoods = ["carrot", "chorus_fruit", "wheat"] as const;
export type AvailableFood = (typeof availableFoods)[number];

export const getAllFoodItems = () =>
  getAllItems<AvailableFood, Food>("_food-*");
