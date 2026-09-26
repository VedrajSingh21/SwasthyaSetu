import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { eq, inArray } from 'drizzle-orm';
import { patients } from '../../database/schema/patients.js';

@Injectable()
export class PatientsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async findAll() {
    return this.db.query.patients.findMany();
  }

  async findOne(id: string) {
    const patient = await this.db.select().from(patients).where(eq(patients.id, id));
    if (!patient || patient.length === 0) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient[0];
  }

  async findCareBundles(id: string) {
    // Basic verification that patient exists (throws 404 if not)
    await this.findOne(id);
    
    const { careBundles, careRequirements } = await import('../../database/schema/care.js');
    
    // Get bundles for this patient
    const bundles = await this.db.select().from(careBundles).where(eq(careBundles.patientId, id));
    
    if (bundles.length > 0) {
      const bundleIds = bundles.map((b: any) => b.id);
      
      // Filter specifically by bundle IDs instead of scanning whole table
      const reqs = await this.db.select().from(careRequirements).where(inArray(careRequirements.careBundleId, bundleIds));
      
      return bundles.map((b: any) => ({
        ...b,
        requirements: reqs.filter((r: any) => r.careBundleId === b.id)
      }));
    }
    
    return bundles;
  }

  async findReferrals(id: string) {
    await this.findOne(id);
    const { referrals } = await import('../../database/schema/referrals.js');
    const refs = await this.db.select().from(referrals).where(eq(referrals.patientId, id));
    // Normalize targetFacilityId for frontend backwards compatibility
    return refs.map((r: any) => ({
      ...r,
      targetFacilityId: r.destinationFacilityId,
      sourceFacilityId: r.referringFacilityId,
    }));
  }

  async findJourneys(id: string) {
    await this.findOne(id);
    const { careJourneys, careJourneyEvents } = await import('../../database/schema/journeys.js');
    const { careRequirements } = await import('../../database/schema/care.js');
    
    const journeys = await this.db.select().from(careJourneys).where(eq(careJourneys.patientId, id));
    
    if (journeys.length === 0) return [];

    return Promise.all(journeys.map(async (j: any) => {
      const events = await this.db.select().from(careJourneyEvents).where(eq(careJourneyEvents.journeyId, j.id));
      const reqs = j.careBundleId 
         ? await this.db.select().from(careRequirements).where(eq(careRequirements.careBundleId, j.careBundleId))
         : [];
      return {
         ...j,
         events: events.sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime()),
         requirements: reqs
      };
    }));
  }
}
