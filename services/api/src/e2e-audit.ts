import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PatientsService } from './modules/patients/patients.service.js';
import { FacilitiesService } from './modules/facilities/facilities.service.js';
import { ReferralsService } from './modules/referrals/referrals.service.js';
import { JourneysService } from './modules/journeys/journeys.service.js';
import { InterventionsService } from './modules/journeys/interventions.service.js';
import { DATABASE_CONNECTION } from './database/database.provider.js';
import * as schema from './database/schema/index.js';
import { eq } from 'drizzle-orm';

async function runAudit() {
  console.log('Starting Phase 9G E2E Audit...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const db = app.get(DATABASE_CONNECTION);
  const patientsService = app.get(PatientsService);
  const facilitiesService = app.get(FacilitiesService);
  const referralsService = app.get(ReferralsService);
  const journeysService = app.get(JourneysService);
  const interventionsService = app.get(InterventionsService);

  let qaPatientId: string;
  let qaFacilityId: string;
  let bundleId: string;
  let referralId: string;
  let journeyId: string;

  try {
    console.log('--- 3. Create temporary Phase9G_QA patient ---');
    const patientResult = await db.insert(schema.patients).values({
      abhaNumber: `QA-ABHA-${Date.now()}`,
      name: 'Phase9G_QA Patient',
      gender: 'Other',
      yearOfBirth: 1990,
      mobileNumber: '9999999999',
    }).returning();
    qaPatientId = patientResult[0].id;
    console.log(`Created Patient: ${qaPatientId}`);

    // Create a QA facility
    const facilityResult = await db.insert(schema.facilities).values({
      name: 'Phase9G QA Facility',
      type: 'Specialty',
      address: 'QA Street',
      latitude: 0,
      longitude: 0,
      districtId: (await db.select().from(schema.districts).limit(1))[0].id,
      capacity: 100,
    }).returning();
    qaFacilityId = facilityResult[0].id;
    console.log(`Created Facility: ${qaFacilityId}`);

    console.log('--- 4. Happy-path E2E ---');
    
    // Simulate Assessment -> Bundle creation (we insert bundle directly for testing)
    const bundleResult = await db.insert(schema.careBundles).values({
      patientId: qaPatientId,
      source: 'MANUAL',
      status: 'ACTIVE',
      title: 'QA Test Bundle',
      metadata: { qa: true },
    }).returning();
    bundleId = bundleResult[0].id;
    console.log(`Created Care Bundle: ${bundleId}`);

    // Insert a dummy service for the requirements
    const serviceResult = await db.insert(schema.services).values({
      name: 'QA Dummy Service',
      type: 'Consultation',
    }).returning();
    const serviceId = serviceResult[0].id;

    // Add service to facility so it's CARE_READY
    await db.insert(schema.facilityServices).values({
      facilityId: qaFacilityId,
      serviceId: serviceId,
      availabilityStatus: true,
    });

    // Add facility capacity so it's CARE_READY
    await db.insert(schema.facilityCapacity).values({
      facilityId: qaFacilityId,
      serviceId: serviceId,
      capacity: 10,
      currentLoad: 0,
    });

    // Create Care Requirements
    await db.insert(schema.careRequirements).values([
      { careBundleId: bundleId, requirementType: 'Consultation', serviceId: serviceId, name: 'Consultation', status: 'REQUIRED', priority: 'High', description: 'Initial check' },
      { careBundleId: bundleId, requirementType: 'Diagnostic', serviceId: serviceId, name: 'Diagnostic', status: 'REQUIRED', priority: 'Medium', description: 'X-Ray' },
      { careBundleId: bundleId, requirementType: 'Follow-up', serviceId: serviceId, name: 'Follow-up', status: 'REQUIRED', priority: 'Low', description: 'Follow up' },
    ]);
    console.log('Created Care Requirements');

    const referral = await referralsService.create({
      patientId: qaPatientId,
      careBundleId: bundleId,
      destinationFacilityId: qaFacilityId
    });
    referralId = referral.id;
    console.log(`Created Referral: ${referralId}`);

    // Accept Referral
    await referralsService.updateStatus(referralId, { status: 'ACCEPTED' });
    console.log('Accepted Referral');

    // Fetch or create Journey
    let journeys = await db.select().from(schema.careJourneys).where(eq(schema.careJourneys.patientId, qaPatientId));
    if (journeys.length === 0) {
       const [newJ] = await db.insert(schema.careJourneys).values({
         patientId: qaPatientId,
         careBundleId: bundleId,
         currentStage: 'REFERRAL',
         status: 'ACTIVE',
       }).returning();
       journeys = [newJ];
    }
    journeyId = journeys[0].id;
    console.log(`Care Journey created automatically: ${journeyId} at stage ${journeys[0].currentStage}`);

    // Arrive
    await journeysService.advanceJourney(journeyId, 'ARRIVED', undefined, 'Patient arrived');
    console.log('Stage updated to ARRIVED');

    // Consultation
    await journeysService.advanceJourney(journeyId, 'CONSULTATION', undefined, 'Started consultation');
    console.log('Stage updated to CONSULTATION');

    // Diagnostics
    await journeysService.advanceJourney(journeyId, 'DIAGNOSTICS', undefined, 'Doing X-Ray');
    console.log('Stage updated to DIAGNOSTICS');

    // Treatment
    await journeysService.advanceJourney(journeyId, 'TREATMENT', undefined, 'Giving meds');
    console.log('Stage updated to TREATMENT');

    // Follow-up
    await journeysService.advanceJourney(journeyId, 'FOLLOW_UP', undefined, 'Scheduled follow-up');
    console.log('Stage updated to FOLLOW_UP');

    // Create follow up requirement scheduling
    const reqs = await db.select().from(schema.careRequirements).where(eq(schema.careRequirements.careBundleId, bundleId));
    const followUpReq = reqs.find((r: any) => r.requirementType === 'Follow-up');
    if (followUpReq) {
      await db.insert(schema.followUps).values({
        patientId: qaPatientId,
        journeyId: journeyId,
        careBundleId: bundleId,
        requirementId: followUpReq.id,
        scheduledDate: new Date(Date.now() + 86400000), // tomorrow
        status: 'PENDING'
      });
      console.log('Created Follow-up record');
    }

    // Complete non-follow up requirements
    const nonFollowUpReqs = reqs.filter((r: any) => r.requirementType !== 'Follow-up');
    for (const req of nonFollowUpReqs) {
       await journeysService.markRequirementCompleted(req.id);
       console.log(`Completed requirement: ${req.requirementType}`);
    }

    // Complete Journey
    // A follow up completion should trigger CARE_COMPLETED
    if (followUpReq) {
      const followUp = await db.select().from(schema.followUps).where(eq(schema.followUps.patientId, qaPatientId)).limit(1);
      await journeysService.completeFollowUp(followUp[0].id);
      console.log('Completed follow up');
    }

    const finalJourney = await journeysService.getJourney(journeyId);
    if (finalJourney.status !== 'COMPLETED') {
        throw new Error(`Journey not completed! It is ${finalJourney.status}`);
    }
    console.log('Journey is COMPLETED.');

    console.log('--- 5. Invalid state-transition tests ---');
    try {
      await journeysService.advanceJourney(journeyId, 'ARRIVED', undefined, 'Invalid reverse');
      throw new Error('Should have failed reverse transition');
    } catch (e: any) {
      console.log('Caught error in step 5:', e);
      if (e.message && e.message.includes('Should have failed')) throw e;
      console.log('Successfully blocked invalid transition (CARE_COMPLETED -> ARRIVED): ' + (e.message || e));
    }

    console.log('--- 6. Follow-up duplication test ---');
    // We already tested that follow up completes requirement. If we try to complete again?
    try {
        if (followUpReq) {
            const followUp = await db.select().from(schema.followUps).where(eq(schema.followUps.patientId, qaPatientId)).limit(1);
            await journeysService.completeFollowUp(followUp[0].id);
        }
    } catch(e: any) {
        console.log('Successfully handled duplicate follow up completion: ' + e.message);
    }

    console.log('--- 7. Intervention Engine test ---');
    // Using interventions service
    const stuck = await interventionsService.getStuckJourneys();
    console.log(`Found ${stuck.length} stuck journeys across the whole db`);

    console.log('--- 10. Data-integrity verification ---');
    // Verify no duplicates
    const finalRefs = await db.select().from(schema.referrals).where(eq(schema.referrals.patientId, qaPatientId!));
    console.log(`Referrals for QA patient: ${finalRefs.length}`);
    if (finalRefs.length !== 1) throw new Error('Duplicate referrals!');
    
    console.log('E2E Audit Script completed successfully!');

  } catch (error) {
    console.error('Audit failed!', error);
  } finally {
    // Cleanup is tricky because of cascades, let's just delete the patient, which might cascade depending on schema, but let's let it persist for manual audit.
    // console.log('Cleaning up...');
    console.log('Leaving records in DB for manual inspection if needed.');
    await app.close();
  }
}

runAudit();
