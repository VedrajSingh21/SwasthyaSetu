import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from './src/database/database.provider.js';
import { facilityServices, facilities } from './src/database/schema/facilities.js';
import { eq } from 'drizzle-orm';
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

    console.log(`Restoring services at (${demoFacilityId})...`);
    
    // Re-enable all services for the demo facility
    await db.update(facilityServices)
      .set({ availabilityStatus: true })
      .where(eq(facilityServices.facilityId, demoFacilityId));
      
    console.log(`Restored all services to available.`);
    console.log('Facility should now be evaluated as CARE_READY again.');

  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await app.close();
  }
}

run();
