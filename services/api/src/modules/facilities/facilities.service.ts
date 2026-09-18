import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { eq, and, notInArray, desc } from 'drizzle-orm';
import { facilities } from '../../database/schema/facilities.js';
import { referrals } from '../../database/schema/referrals.js';
import { patients } from '../../database/schema/patients.js';
import { careBundles } from '../../database/schema/care.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class FacilitiesService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async findAll() {
    return this.db.query.facilities.findMany();
  }

  async findOne(id: string) {
    const facility = await this.db.select().from(facilities).where(eq(facilities.id, id));
    if (!facility || facility.length === 0) {
      throw new NotFoundException(`Facility with ID ${id} not found`);
    }
    return facility[0];
  }

  async findFacilityReferrals(facilityId: string) {
    // Validate facility exists first
    await this.findOne(facilityId);

    // Return inbound referrals matching facility, filtering active ones
    // We include PENDING and ACCEPTED for the primary workflow.
    // We exclude COMPLETED and CANCELLED to keep the active queue clean.
    return this.db.select({
      id: referrals.id,
      patientId: referrals.patientId,
      careBundleId: referrals.careBundleId,
      destinationFacilityId: referrals.destinationFacilityId,
      priority: referrals.priority,
      status: referrals.status,
      reason: referrals.reason,
      createdAt: referrals.createdAt,
      updatedAt: referrals.updatedAt,
      patient: {
        name: patients.name,
        gender: patients.gender,
      },
      bundle: {
        title: careBundles.title,
      }
    })
    .from(referrals)
    .leftJoin(patients, eq(referrals.patientId, patients.id))
    .leftJoin(careBundles, eq(referrals.careBundleId, careBundles.id))
    .where(
      and(
        eq(referrals.destinationFacilityId, facilityId),
        notInArray(referrals.status, ['COMPLETED', 'CANCELLED'])
      )
    )
    .orderBy(desc(referrals.createdAt));
  }
}
