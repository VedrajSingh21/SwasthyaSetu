import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';
import { patients } from './patients.js';
import { careBundles, careRequirements } from './care.js';
import { facilities } from './facilities.js';
import { referralStatusEnum, priorityEnum, appointmentStatusEnum } from './enums.js';

export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  careBundleId: uuid('care_bundle_id').references(() => careBundles.id).notNull(),
  referringFacilityId: uuid('referring_facility_id').references(() => facilities.id),
  destinationFacilityId: uuid('destination_facility_id').references(() => facilities.id),
  priority: priorityEnum('priority'),
  status: referralStatusEnum('status').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const referralEvents = pgTable('referral_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  referralId: uuid('referral_id').references(() => referrals.id).notNull(),
  eventType: text('event_type').notNull(),
  previousStatus: referralStatusEnum('previous_status'),
  newStatus: referralStatusEnum('new_status'),
  metadata: jsonb('metadata'),
  actorId: uuid('actor_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  facilityId: uuid('facility_id').references(() => facilities.id).notNull(),
  referralId: uuid('referral_id').references(() => referrals.id),
  requirementId: uuid('requirement_id').references(() => careRequirements.id),
  scheduledDate: timestamp('scheduled_date'),
  status: appointmentStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
