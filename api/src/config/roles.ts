export const ALL_ROLES = [
  'DEFAULT',    // default role
  'ADMIN',      // discord server owners and admins added by the server owner
  'SUPER_ADMIN' // bot developers
] as const;

export type Role = (typeof ALL_ROLES)[number];

export const ROLES = ALL_ROLES.reduce(
  (acc, role) => {
    acc[role] = role;
    return acc;
  },
  {} as Record<Role, Role>
);