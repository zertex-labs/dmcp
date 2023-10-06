import type { Nullable, Pet } from '.';

export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;

  pets?: Pet[];
  activePet?: Nullable<Pet>;
};
