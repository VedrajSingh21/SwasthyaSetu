import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { eq } from 'drizzle-orm';
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
    
    // Import dynamically as in other methods
    const { careBundles, careRequirements } = await import('../../database/schema/care.js');
    
    // Get bundles
    const bundles = await this.db.select().from(careBundles).where(eq(careBundles.patientId, id));
    
    // Get requirements for those bundles
    if (bundles.length > 0) {
      const bundleIds = bundles.map((b: any) => b.id);
      
      // Drizzle 'inArray' would be better, but doing it manually or via multiple queries is safer if we don't import inArray.
      // Easiest is to fetch all requirements for this patient's bundles
      // Actually we can just return the bundles. The dashboard only uses bundle.title, bundle.priority, bundle.status. 
      // Requirements are useful but we can attach an empty array or fetch them if needed.
      const reqs = await this.db.select().from(careRequirements);
      
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
    return this.db.select().from(referrals).where(eq(referrals.patientId, id));
  }

  async findJourneys(id: string) {
    await this.findOne(id);
    const { careJourneys } = await import('../../database/schema/journeys.js');
    return this.db.select().from(careJourneys).where(eq(careJourneys.patientId, id));
  }
}
