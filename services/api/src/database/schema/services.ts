import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { requirementTypeEnum } from './enums';

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: requirementTypeEnum('type').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
