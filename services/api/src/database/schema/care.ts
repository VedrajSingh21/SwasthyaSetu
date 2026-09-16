import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core';
import { patients } from './patients.js';
import { services } from './services.js';
import { careBundleSourceEnum, priorityEnum, requirementStatusEnum, requirementTypeEnum } from './enums.js';

export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  source: text('source'),
  rawInput: jsonb('raw_input'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const careBundles = pgTable('care_bundles', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  assessmentId: uuid('assessment_id').references(() => assessments.id),
  title: text('title').notNull(),
  priority: priorityEnum('priority'),
  status: text('status'),
  source: careBundleSourceEnum('source'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const careRequirements = pgTable('care_requirements', {
  id: uuid('id').defaultRandom().primaryKey(),
  careBundleId: uuid('care_bundle_id').references(() => careBundles.id).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  requirementType: requirementTypeEnum('requirement_type'),
  name: text('name').notNull(),
  priority: priorityEnum('priority'),
  status: requirementStatusEnum('status'),
  sequence: integer('sequence'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
