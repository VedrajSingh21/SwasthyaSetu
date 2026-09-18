import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { CreateReferralDto } from './dto/create-referral.dto.js';
import { CareReadinessService } from '../care-readiness/care-readiness.service.js';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, notInArray } from 'drizzle-orm';
import { referrals, referralEvents } from '../../database/schema/referrals.js';
import { patients } from '../../database/schema/patients.js';
import { careBundles } from '../../database/schema/care.js';
import { facilities } from '../../database/schema/facilities.js';

@Injectable()
export class ReferralsService {
  constructor(
    private readonly careReadinessService: CareReadinessService,
    @Inject(DATABASE_CONNECTION) private readonly db: PostgresJsDatabase<any>,
  ) {}

  async create(dto: CreateReferralDto) {
    // 1. Validate the referenced patient exists.
    const [patient] = await this.db.select().from(patients).where(eq(patients.id, dto.patientId));
    if (!patient) {
      throw new NotFoundException(`Patient ${dto.patientId} not found`);
    }

    // 2. Validate the Care Bundle exists.
    const [careBundle] = await this.db.select().from(careBundles).where(eq(careBundles.id, dto.careBundleId));
    if (!careBundle) {
      throw new NotFoundException(`Care Bundle ${dto.careBundleId} not found`);
    }

    // 3. Validate the destination facility exists.
    const [facility] = await this.db.select().from(facilities).where(eq(facilities.id, dto.destinationFacilityId));
    if (!facility) {
      throw new NotFoundException(`Facility ${dto.destinationFacilityId} not found`);
    }

    // 4. Validate the Care Bundle belongs to the specified patient.
    if (careBundle.patientId !== dto.patientId) {
      throw new BadRequestException(`Care Bundle ${dto.careBundleId} does not belong to Patient ${dto.patientId}`);
    }

    // 5. Verify the destination facility is actually suitable (CARE_READY)
    const readiness = await this.careReadinessService.getFacilityReadiness(dto.destinationFacilityId, dto.careBundleId);
    if (readiness.status !== 'CARE_READY') {
      throw new BadRequestException(`Facility ${dto.destinationFacilityId} is NOT CARE_READY for Care Bundle ${dto.careBundleId}`);
    }

    // 6. Check for active duplicate referral
    const existingActiveReferrals = await this.db.select().from(referrals).where(
      and(
        eq(referrals.patientId, dto.patientId),
        eq(referrals.careBundleId, dto.careBundleId),
        eq(referrals.destinationFacilityId, dto.destinationFacilityId),
        notInArray(referrals.status, ['COMPLETED', 'CANCELLED'])
      )
    );

    if (existingActiveReferrals.length > 0) {
      throw new ConflictException(`An active referral already exists for this patient, care bundle, and destination facility.`);
    }

    // 7. Referral Creation Transaction
    const result = await this.db.transaction(async (tx) => {
      // Create referral
      const [newReferral] = await tx.insert(referrals).values({
        patientId: dto.patientId,
        careBundleId: dto.careBundleId,
        destinationFacilityId: dto.destinationFacilityId,
        status: 'PENDING',
        reason: dto.reason || 'Routine referral',
        priority: 'Medium', // default priority
      }).returning();

      // Create initial referral event
      await tx.insert(referralEvents).values({
        referralId: newReferral.id,
        eventType: 'CREATED',
        newStatus: 'PENDING',
        metadata: {
          destinationFacilityId: dto.destinationFacilityId,
          reason: dto.reason || 'Routine referral',
        },
      });

      return newReferral;
    });

    return result;
  }
}
