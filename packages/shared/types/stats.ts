export const playerStats = ['FARMING_FORTUNE', 'FARMING_SPEED'] as const;
export type PlayerStat = (typeof playerStats)[number];

const createStats = (value: number) =>
  playerStats.reduce(
    (acc, x) => {
      acc[x] = value;
      return acc;
    },
    {} as Record<PlayerStat, number>
  );

export const createBaseStats = () => createStats(1);
export const createBaseChances = () => createStats(0);
