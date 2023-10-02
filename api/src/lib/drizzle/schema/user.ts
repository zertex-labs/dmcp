import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { ALL_ROLES, ALL_PERMISSIONS } from '../../../config';

export const userTable = pgTable('user', {
  id: text('id').primaryKey().notNull(), // discord user id
  serverId: text('server_id').notNull(), // discord server id
  role: text('role', {
    enum: ALL_ROLES
  }).default('DEFAULT'),
  permissions: text('permissions', {
    enum: ALL_PERMISSIONS
  })
    .array()
    .notNull()
});