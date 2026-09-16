import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { roleEnum } from './enums.js';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: roleEnum('role').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
