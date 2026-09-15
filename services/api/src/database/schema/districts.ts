import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const districts = pgTable('districts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  state: text('state').notNull(),
  code: text('code'),
});
