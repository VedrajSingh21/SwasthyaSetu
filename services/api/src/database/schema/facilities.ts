import { pgTable, text, timestamp, boolean, integer, doublePrecision, uuid } from 'drizzle-orm/pg-core';
import { facilityTypeEnum } from './enums';
import { districts } from './districts';
import { services } from './services';

export const facilities = pgTable('facilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  districtId: uuid('district_id').references(() => districts.id),
  type: facilityTypeEnum('type').notNull(),
  address: text('address'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const facilityServices = pgTable('facility_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  facilityId: uuid('facility_id').references(() => facilities.id).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  availabilityStatus: boolean('availability_status').default(true).notNull(),
  lastUpdatedAt: timestamp('last_updated_at').defaultNow().notNull(),
});

export const facilityCapacity = pgTable('facility_capacity', {
  id: uuid('id').defaultRandom().primaryKey(),
  facilityId: uuid('facility_id').references(() => facilities.id).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  capacity: integer('capacity').default(0).notNull(),
  currentLoad: integer('current_load').default(0).notNull(),
  availabilityStatus: boolean('availability_status').default(true).notNull(),
  lastUpdatedAt: timestamp('last_updated_at').defaultNow().notNull(),
});
