import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { districts } from './districts';

export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  name: text('name').notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  gender: text('gender'),
  phone: text('phone'),
  preferredLanguage: text('preferred_language'),
  districtId: uuid('district_id').references(() => districts.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
