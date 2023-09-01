import { ALL_ROLES } from './roles';

// not global; discord server specific
export const ALL_PERMISSIONS = [
  // PETS
  `pets:create`, // general create permission, count is managed by pets.maxCount

  'pets:read:self',
  'pets:update:self',
  'pets:delete:self',

  'pets:read:all',
  'pets:update:all',
  'pets:delete:all'
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const PERMISSIONS: Record<Permission, Permission> =
  ALL_PERMISSIONS.reduce(
    (acc, permission) => {
      acc[permission] = permission;
      return acc;
    },
    {} as Record<Permission, Permission>
  );

export const PERMISSIONS_BY_ROLE: Record<
  (typeof ALL_ROLES)[0 | 1],
  Permission[]
> = {
  DEFAULT: ALL_PERMISSIONS.slice(0, 4),
  ADMIN: ALL_PERMISSIONS as unknown as Permission[]
};
