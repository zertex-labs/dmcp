import type { AvailableFood, Food } from "shared";

import { getAllItems } from ".";

export const getAllFoodItems = () =>
  getAllItems<AvailableFood, Food>("_food-*");

