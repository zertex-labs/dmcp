import { getAllItems } from ".";
import { Pet } from "../types";

export const availablePets = ["COW", "FOX"] as const;
export type AvailablePet = (typeof availablePets)[number];

export const getAllPets = () =>
  getAllItems<AvailablePet, Pet>('_pet-*');