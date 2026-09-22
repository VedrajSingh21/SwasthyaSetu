import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from './src/database/database.provider.js';
import { patients } from './src/database/schema/patients.js';
import { careBundles } from './src/database/schema/care.js';
import { facilities } from './src/database/schema/facilities.js';
import { referrals, referralEvents } from './src/database/schema/referrals.js';
import { careJourneys } from './src/database/schema/journeys.js';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../../.env') });

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get<PostgresJsDatabase<any>>(DATABASE_CONNECTION);

  try {
    const demoPatientId = process.env.VITE_DEMO_PATIENT_ID;
    const demoFacilityId = process.env.VITE_DEMO_FACILITY_ID;
    
    if (!demoPatientId || !demoFacilityId) {
      throw new Error('VITE_DEMO_PATIENT_ID or VITE_DEMO_FACILITY_ID not set');
    }

    // Get patient and bundle
    const [patient] = await db.select().from(patients).where(eq(patients.id, demoPatientId));
    const [bundle] = await db.select().from(careBundles).where(eq(careBundles.patientId, demoPatientId)).limit(1);

    if (!patient || !bundle) {
      console.log('Seed data missing');
      return;
    }

    // Delete existing active referrals for this patient to ensure clean slate
    await db.delete(referralEvents);
    await db.delete(referrals).where(eq(referrals.patientId, demoPatientId));
    await db.delete(careJourneys).where(eq(careJourneys.patientId, demoPatientId));

    // Create Journey
    const [journey] = await db.insert(careJourneys).values({
      patientId: patient.id,
      careBundleId: bundle.id,
      currentStage: 'Diagnostic',
      status: 'Active',
      startDate: new Date().toISOString(),
    }).returning();

    // Create Referral to Demo Facility
    const [newReferral] = await db.insert(referrals).values({
      patientId: patient.id,
      careBundleId: bundle.id,
      destinationFacilityId: demoFacilityId,
      status: 'PENDING',
      reason: 'Demo Referral',
      priority: 'Medium',
    }).returning();

    await db.insert(referralEvents).values({
      referralId: newReferral.id,
      eventType: 'CREATED',
      newStatus: 'PENDING',
      metadata: { destinationFacilityId: demoFacilityId },
    });

    console.log(`Created referral ${newReferral.id} for patient ${demoPatientId} to facility ${demoFacilityId}`);

  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await app.close();
  }
}

run();
