import { User } from "./users";

export const ALL_PETS = ['FOX', 'CAT', 'DOG', 'PANDA'] as const;
export type PetType = (typeof ALL_PETS)[number];

export type Pet = {
  uuid: string;
  type: PetType;
  ownerId: string;
  displayName: string;
  
  createdAt: string;
  updatedAt: string;
}

export type PetWithOwner = Pet & {
  owner: User;
}