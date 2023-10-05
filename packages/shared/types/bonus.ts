export const availableBonuses = ["PERK_SPEED", "PERK_FARMING"] as const;
export type AvailableBonus = (typeof availableBonuses)[number];
