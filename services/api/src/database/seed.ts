import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding database...');

  try {
    // 1. Create a fictional district
    const [district] = await db.insert(schema.districts).values({
      name: 'Demo District Alpha',
      state: 'Demo State',
      code: 'DDA',
    }).returning();

    // 2. Create fictional services
    const [cardio, ecg, blood, followup] = await db.insert(schema.services).values([
      { name: 'Cardiology consultation', type: 'Consultation' },
      { name: 'ECG', type: 'Diagnostic' },
      { name: 'Basic blood investigation', type: 'Diagnostic' },
      { name: 'Follow-up', type: 'Consultation' },
    ]).returning();

    // 3. Create fictional facilities
    const [refFacility, facilityA, facilityB] = await db.insert(schema.facilities).values([
      { name: 'Demo Primary Center (Referring)', type: 'PHC', districtId: district.id },
      { name: 'Demo Hospital A (No ECG)', type: 'DH', districtId: district.id },
      { name: 'Demo Hospital B (Fully Equipped)', type: 'DH', districtId: district.id },
    ]).returning();

    // 4. Create facility services
    await db.insert(schema.facilityServices).values([
      // Facility A (Missing ECG)
      { facilityId: facilityA.id, serviceId: cardio.id, availabilityStatus: true },
      { facilityId: facilityA.id, serviceId: ecg.id, availabilityStatus: false }, // ECG unavailable
      { facilityId: facilityA.id, serviceId: blood.id, availabilityStatus: true },
      { facilityId: facilityA.id, serviceId: followup.id, availabilityStatus: true },
      
      // Facility B (Has everything)
      { facilityId: facilityB.id, serviceId: cardio.id, availabilityStatus: true },
      { facilityId: facilityB.id, serviceId: ecg.id, availabilityStatus: true },
      { facilityId: facilityB.id, serviceId: blood.id, availabilityStatus: true },
      { facilityId: facilityB.id, serviceId: followup.id, availabilityStatus: true },
    ]);

    // 5. Create facility capacity
    await db.insert(schema.facilityCapacity).values([
      { facilityId: facilityA.id, serviceId: cardio.id, capacity: 10, currentLoad: 5 },
      { facilityId: facilityA.id, serviceId: blood.id, capacity: 50, currentLoad: 20 },
      
      { facilityId: facilityB.id, serviceId: cardio.id, capacity: 15, currentLoad: 8 },
      { facilityId: facilityB.id, serviceId: ecg.id, capacity: 5, currentLoad: 2 },
      { facilityId: facilityB.id, serviceId: blood.id, capacity: 50, currentLoad: 10 },
    ]);

    // 6. Create a fictional patient
    const [patient] = await db.insert(schema.patients).values({
      name: 'John Doe (Demo)',
      districtId: district.id,
      gender: 'Male',
    }).returning();

    // 7. Create Care Bundle and Requirements
    const [careBundle] = await db.insert(schema.careBundles).values({
      patientId: patient.id,
      title: 'Cardiac Evaluation (Demo)',
      priority: 'High',
      source: 'RULE_ENGINE',
    }).returning();

    await db.insert(schema.careRequirements).values([
      { careBundleId: careBundle.id, serviceId: cardio.id, name: 'Cardiology consultation', priority: 'High', sequence: 1 },
      { careBundleId: careBundle.id, serviceId: ecg.id, name: 'ECG', priority: 'High', sequence: 2 },
      { careBundleId: careBundle.id, serviceId: blood.id, name: 'Basic blood investigation', priority: 'Medium', sequence: 3 },
    ]);

    // 8. Create a referral and events
    const [referral] = await db.insert(schema.referrals).values({
      patientId: patient.id,
      careBundleId: careBundle.id,
      referringFacilityId: refFacility.id,
      destinationFacilityId: facilityA.id,
      priority: 'High',
      status: 'BLOCKED',
      reason: 'ECG Unavailable at destination',
    }).returning();

    await db.insert(schema.referralEvents).values([
      { referralId: referral.id, eventType: 'CREATED', newStatus: 'PENDING' },
      { referralId: referral.id, eventType: 'STATUS_CHANGED', previousStatus: 'PENDING', newStatus: 'BLOCKED', metadata: { reason: 'Missing ECG' } },
    ]);

    // 9. Create care journey
    const [journey] = await db.insert(schema.careJourneys).values({
      patientId: patient.id,
      careBundleId: careBundle.id,
      currentStage: 'REFERRAL',
      status: 'ACTIVE',
    }).returning();

    await db.insert(schema.careJourneyEvents).values([
      { journeyId: journey.id, stage: 'ASSESSMENT', eventType: 'COMPLETED' },
      { journeyId: journey.id, stage: 'REFERRAL', eventType: 'INITIATED' },
      { journeyId: journey.id, stage: 'REFERRAL', eventType: 'BLOCKED', metadata: { bottleneck: 'ECG' } },
    ]);

    // 10. Create bottleneck
    await db.insert(schema.bottlenecks).values({
      districtId: district.id,
      facilityId: facilityA.id,
      service: 'ECG',
      bottleneckType: 'EQUIPMENT_UNAVAILABLE',
      severity: 'High',
      reason: 'Machine under maintenance',
      status: 'DETECTED',
    });

    console.log('Database seeded successfully with demo data!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    process.exit(0);
  }
}

seed();
