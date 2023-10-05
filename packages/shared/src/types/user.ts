import type { Maybe, Pet } from '.';

export type User = {
  id: string;
  activePet: Maybe<Pet>;
  createdAt: string;
  updatedAt: string;
};
