export const availablePerks = ['PERK_SPEED', 'PERK_FARMING'] as const;
export type AvailablePerk = (typeof availablePerks)[number];
