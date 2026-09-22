import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { ReferralsService } from './src/modules/referrals/referrals.service.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from './src/database/database.provider.js';
import { patients } from './src/database/schema/patients.js';
import { careBundles } from './src/database/schema/care.js';
import { facilities } from './src/database/schema/facilities.js';
import { referrals, referralEvents } from './src/database/schema/referrals.js';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../../.env') });

async function runTest() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const referralsService = app.get(ReferralsService);
  const db = app.get<PostgresJsDatabase<any>>(DATABASE_CONNECTION);

  try {
    const [patient] = await db.select().from(patients).limit(1);
    const [bundle] = await db.select().from(careBundles).limit(1);
    
    // Facility B (Fully Equipped) from seed should be CARE_READY
    const allFacilities = await db.select().from(facilities);
    const facilityB = allFacilities.find(f => f.name.includes('Fully Equipped'));

    if (!patient || !bundle || !facilityB) {
      console.log('Seed data missing');
      return;
    }

    console.log('Creating valid referral...');
    const result = await referralsService.create({
      patientId: patient.id,
      careBundleId: bundle.id,
      destinationFacilityId: facilityB.id,
      reason: 'Automated test referral',
    });
    
    console.log('Success! Created referral:', result.id);

    // Verify it exists
    const [verif] = await db.select().from(referrals).where(eq(referrals.id, result.id));
    console.log('Verified referral status:', verif.status);
    
    const events = await db.select().from(referralEvents).where(eq(referralEvents.referralId, result.id));
    console.log('Verified events created:', events.length);

    console.log('Testing invalid UUID...');
    try {
      await referralsService.create({
        patientId: 'invalid-uuid',
        careBundleId: bundle.id,
        destinationFacilityId: facilityB.id,
      });
    } catch (err: any) {
      console.log('Expected error on invalid UUID:', err.message);
    }

    console.log('Testing NOT_CARE_READY...');
    const facilityA = allFacilities.find(f => f.name.includes('No ECG'));
    try {
      await referralsService.create({
        patientId: patient.id,
        careBundleId: bundle.id,
        destinationFacilityId: facilityA!.id,
      });
    } catch (err: any) {
      console.log('Expected error on NOT_CARE_READY:', err.message);
    }

    console.log('Testing duplicate...');
    try {
      await referralsService.create({
        patientId: patient.id,
        careBundleId: bundle.id,
        destinationFacilityId: facilityB.id,
      });
    } catch (err: any) {
      console.log('Expected error on duplicate:', err.message);
    }

    // Cleanup the created referral to keep DB clean
    console.log('Cleaning up test data...');
    await db.delete(referralEvents).where(eq(referralEvents.referralId, result.id));
    await db.delete(referrals).where(eq(referrals.id, result.id));
    console.log('Cleanup complete.');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await app.close();
  }
}

runTest();
