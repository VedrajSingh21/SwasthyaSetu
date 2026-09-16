import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { districts } from './districts.js';
import { facilities } from './facilities.js';
import { bottleneckStatusEnum, priorityEnum } from './enums.js';

export const bottlenecks = pgTable('bottlenecks', {
  id: uuid('id').defaultRandom().primaryKey(),
  districtId: uuid('district_id').references(() => districts.id),
  facilityId: uuid('facility_id').references(() => facilities.id),
  service: text('service'),
  bottleneckType: text('bottleneck_type'),
  severity: priorityEnum('severity'),
  reason: text('reason'),
  status: bottleneckStatusEnum('status'),
  detectedAt: timestamp('detected_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});
