export const petUpgrades = ['PET_UPGRADE_TODO'] as const;
export type PetUpgrade = (typeof petUpgrades)[number];
