import type { AvailablePet, Pet } from "shared";

import { getAllItems } from ".";

export const getAllPets = () => getAllItems<AvailablePet, Pet>("_pet-*");
