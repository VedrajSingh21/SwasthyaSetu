import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { careBundles } from './care';
import { referrals } from './referrals';
import { careJourneyStageEnum } from './enums';

export const careJourneys = pgTable('care_journeys', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  careBundleId: uuid('care_bundle_id').references(() => careBundles.id),
  currentStage: careJourneyStageEnum('current_stage'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const careJourneyEvents = pgTable('care_journey_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  journeyId: uuid('journey_id').references(() => careJourneys.id).notNull(),
  stage: careJourneyStageEnum('stage'),
  eventType: text('event_type').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const followUps = pgTable('follow_ups', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  careBundleId: uuid('care_bundle_id').references(() => careBundles.id),
  referralId: uuid('referral_id').references(() => referrals.id),
  scheduledDate: timestamp('scheduled_date'),
  status: text('status'),
  reason: text('reason'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
