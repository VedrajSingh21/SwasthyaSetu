import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from './src/database/database.provider.js';
import { facilityServices, facilities } from './src/database/schema/facilities.js';
import { eq, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../../.env') });

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get<PostgresJsDatabase<any>>(DATABASE_CONNECTION);

  try {
    const demoFacilityId = process.env.VITE_DEMO_FACILITY_ID;
    if (!demoFacilityId) {
      throw new Error('VITE_DEMO_FACILITY_ID not set in .env');
    }

    const [facility] = await db.select().from(facilities).where(eq(facilities.id, demoFacilityId));
    if (!facility) {
      throw new Error(`Facility ${demoFacilityId} not found`);
    }

    // Find the ECG service ID
    // We assume the service name is 'ECG'
    const services = await db.select().from(facilityServices).where(eq(facilityServices.facilityId, demoFacilityId));
    
    console.log(`Simulating disruption at ${facility.name} (${demoFacilityId})...`);
    
    // We'll just disable the first service that is currently available
    const activeService = services.find(s => s.availabilityStatus === true);
    
    if (activeService) {
      await db.update(facilityServices)
        .set({ availabilityStatus: false })
        .where(
          and(
            eq(facilityServices.facilityId, demoFacilityId),
            eq(facilityServices.serviceId, activeService.serviceId)
          )
        );
      console.log(`Disabled service ${activeService.serviceId} to simulate disruption.`);
      console.log('Facility should now be evaluated as NOT_CARE_READY for bundles requiring this service.');
    } else {
      console.log('No active services found to disable.');
    }

  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await app.close();
  }
}

run();
