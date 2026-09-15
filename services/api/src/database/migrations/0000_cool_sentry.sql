CREATE TYPE "public"."appointment_status" AS ENUM('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."bottleneck_status" AS ENUM('DETECTED', 'RESOLVED', 'IGNORED');--> statement-breakpoint
CREATE TYPE "public"."care_bundle_source" AS ENUM('RULE_ENGINE', 'LLM', 'CLINICIAN', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."care_journey_stage" AS ENUM('ASSESSMENT', 'REFERRAL', 'APPOINTMENT', 'TREATMENT', 'FOLLOW_UP');--> statement-breakpoint
CREATE TYPE "public"."facility_type" AS ENUM('SUB_CENTRE', 'PHC', 'CHC', 'DH', 'RURAL_HOSPITAL', 'SPECIALIST_HOSPITAL', 'Specialty');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('High', 'Medium', 'Low');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('PENDING', 'ACCEPTED', 'BLOCKED', 'REROUTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."requirement_status" AS ENUM('REQUIRED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."requirement_type" AS ENUM('Consultation', 'Diagnostic', 'Procedure');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('PATIENT', 'FACILITY', 'ADMIN', 'WORKER');--> statement-breakpoint
CREATE TABLE "bottlenecks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district_id" uuid,
	"facility_id" uuid,
	"service" text,
	"bottleneck_type" text,
	"severity" "priority",
	"reason" text,
	"status" "bottleneck_status",
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"source" text,
	"raw_input" jsonb,
	"status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_bundles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"assessment_id" uuid,
	"title" text NOT NULL,
	"priority" "priority",
	"status" text,
	"source" "care_bundle_source",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"care_bundle_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"requirement_type" "requirement_type",
	"name" text NOT NULL,
	"priority" "priority",
	"status" "requirement_status",
	"sequence" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"code" text
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"district_id" uuid,
	"type" "facility_type" NOT NULL,
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facility_capacity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"current_load" integer DEFAULT 0 NOT NULL,
	"availability_status" boolean DEFAULT true NOT NULL,
	"last_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facility_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"availability_status" boolean DEFAULT true NOT NULL,
	"last_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"date_of_birth" timestamp,
	"gender" text,
	"phone" text,
	"preferred_language" text,
	"district_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "requirement_type" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"referral_id" uuid,
	"requirement_id" uuid,
	"scheduled_date" timestamp,
	"status" "appointment_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"previous_status" "referral_status",
	"new_status" "referral_status",
	"metadata" jsonb,
	"actor_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"care_bundle_id" uuid NOT NULL,
	"referring_facility_id" uuid,
	"destination_facility_id" uuid,
	"priority" "priority",
	"status" "referral_status" NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_journey_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journey_id" uuid NOT NULL,
	"stage" "care_journey_stage",
	"event_type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_journeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"care_bundle_id" uuid,
	"current_stage" "care_journey_stage",
	"status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"care_bundle_id" uuid,
	"referral_id" uuid,
	"scheduled_date" timestamp,
	"status" text,
	"reason" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bottlenecks" ADD CONSTRAINT "bottlenecks_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bottlenecks" ADD CONSTRAINT "bottlenecks_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_bundles" ADD CONSTRAINT "care_bundles_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_bundles" ADD CONSTRAINT "care_bundles_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_requirements" ADD CONSTRAINT "care_requirements_care_bundle_id_care_bundles_id_fk" FOREIGN KEY ("care_bundle_id") REFERENCES "public"."care_bundles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_requirements" ADD CONSTRAINT "care_requirements_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_capacity" ADD CONSTRAINT "facility_capacity_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_capacity" ADD CONSTRAINT "facility_capacity_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_services" ADD CONSTRAINT "facility_services_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_services" ADD CONSTRAINT "facility_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_requirement_id_care_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."care_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_care_bundle_id_care_bundles_id_fk" FOREIGN KEY ("care_bundle_id") REFERENCES "public"."care_bundles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referring_facility_id_facilities_id_fk" FOREIGN KEY ("referring_facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_destination_facility_id_facilities_id_fk" FOREIGN KEY ("destination_facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_journey_events" ADD CONSTRAINT "care_journey_events_journey_id_care_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."care_journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_journeys" ADD CONSTRAINT "care_journeys_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_journeys" ADD CONSTRAINT "care_journeys_care_bundle_id_care_bundles_id_fk" FOREIGN KEY ("care_bundle_id") REFERENCES "public"."care_bundles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_care_bundle_id_care_bundles_id_fk" FOREIGN KEY ("care_bundle_id") REFERENCES "public"."care_bundles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;