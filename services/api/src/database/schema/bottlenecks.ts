import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { districts } from './districts';
import { facilities } from './facilities';
import { bottleneckStatusEnum, priorityEnum } from './enums';

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
