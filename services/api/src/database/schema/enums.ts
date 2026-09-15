import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['PATIENT', 'FACILITY', 'ADMIN', 'WORKER']);
export const facilityTypeEnum = pgEnum('facility_type', ['SUB_CENTRE', 'PHC', 'CHC', 'DH', 'RURAL_HOSPITAL', 'SPECIALIST_HOSPITAL', 'Specialty']);
export const referralStatusEnum = pgEnum('referral_status', ['PENDING', 'ACCEPTED', 'BLOCKED', 'REROUTED', 'COMPLETED', 'CANCELLED']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED']);
export const requirementStatusEnum = pgEnum('requirement_status', ['REQUIRED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']);
export const bottleneckStatusEnum = pgEnum('bottleneck_status', ['DETECTED', 'RESOLVED', 'IGNORED']);
export const careJourneyStageEnum = pgEnum('care_journey_stage', ['ASSESSMENT', 'REFERRAL', 'APPOINTMENT', 'TREATMENT', 'FOLLOW_UP']);
export const careBundleSourceEnum = pgEnum('care_bundle_source', ['RULE_ENGINE', 'LLM', 'CLINICIAN', 'MANUAL']);
export const requirementTypeEnum = pgEnum('requirement_type', ['Consultation', 'Diagnostic', 'Procedure']);
export const priorityEnum = pgEnum('priority', ['High', 'Medium', 'Low']);
