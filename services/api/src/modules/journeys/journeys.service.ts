import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, asc } from 'drizzle-orm';
import { careJourneys, careJourneyEvents } from '../../database/schema/journeys.js';
import { careRequirements } from '../../database/schema/care.js';

@Injectable()
export class JourneysService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: PostgresJsDatabase<any>) {}

  // Stages ordered logically to understand sequence
  private readonly STAGE_ORDER = [
    'ASSESSMENT',
    'REFERRAL',
    'APPOINTMENT',
    'ARRIVED',
    'CONSULTATION',
    'DIAGNOSTICS',
    'TREATMENT',
    'FOLLOW_UP'
  ];
  async getJourney(journeyId: string) {
    const [journey] = await this.db.select().from(careJourneys).where(eq(careJourneys.id, journeyId));
    if (!journey) {
      throw new NotFoundException(`Care Journey ${journeyId} not found`);
    }

    const events = await this.db.select().from(careJourneyEvents)
      .where(eq(careJourneyEvents.journeyId, journeyId))
      .orderBy(asc(careJourneyEvents.createdAt));

    let requirements: any[] = [];
    if (journey.careBundleId) {
      requirements = await this.db.select().from(careRequirements)
        .where(eq(careRequirements.careBundleId, journey.careBundleId));
    }

    return {
      ...journey,
      events,
      requirements
    };
  }

  async advanceJourney(journeyId: string, requestedStage: string, actorId?: string, notes?: string) {
    const [journey] = await this.db.select().from(careJourneys).where(eq(careJourneys.id, journeyId));
    if (!journey) {
      throw new NotFoundException(`Care Journey ${journeyId} not found`);
    }

    if (journey.status === 'COMPLETED') {
      throw new BadRequestException('Care Journey is already completed');
    }

    const currentIdx = this.STAGE_ORDER.indexOf(journey.currentStage || 'ASSESSMENT');
    const requestedIdx = this.STAGE_ORDER.indexOf(requestedStage);

    if (requestedIdx === -1) {
      throw new BadRequestException(`Unknown stage: ${requestedStage}`);
    }

    if (requestedIdx <= currentIdx) {
      throw new BadRequestException(`Cannot move backwards or stay in same stage (current: ${journey.currentStage}, requested: ${requestedStage})`);
    }

    // Verify constraints based on Care Requirements
    if (!journey.careBundleId) {
      throw new BadRequestException('Journey does not have a Care Bundle');
    }

    const reqs = await this.db.select()
      .from(careRequirements)
      .where(eq(careRequirements.careBundleId, journey.careBundleId));

    // Check if the requested stage is actually skipping a required stage
    // For example, if skipping DIAGNOSTICS to TREATMENT, check if there are diagnostics required.
    const hasDiagnostics = reqs.some(r => r.requirementType === 'Diagnostic');
    const hasTreatment = reqs.some(r => r.requirementType === 'Procedure');

    // Rule: Cannot skip Consultation
    if (requestedStage === 'DIAGNOSTICS' || requestedStage === 'TREATMENT') {
      if (currentIdx < this.STAGE_ORDER.indexOf('CONSULTATION')) {
        throw new BadRequestException('Cannot skip CONSULTATION');
      }
    }

    // Rule: Cannot skip Diagnostics if required
    if (requestedStage === 'TREATMENT' && hasDiagnostics) {
      if (currentIdx < this.STAGE_ORDER.indexOf('DIAGNOSTICS')) {
        throw new BadRequestException('Cannot skip DIAGNOSTICS because bundle requires it');
      }
    }

    // Proceed with transition
    return this.db.transaction(async (tx) => {
      const [updated] = await tx.update(careJourneys)
        .set({ currentStage: requestedStage as any, updatedAt: new Date() })
        .where(eq(careJourneys.id, journeyId))
        .returning();

      await tx.insert(careJourneyEvents).values({
        journeyId: journeyId,
        stage: requestedStage as any,
        eventType: 'STAGE_ADVANCED',
        metadata: {
          previousStage: journey.currentStage,
          actorId,
          notes
        },
      });

      return updated;
    });
  }

  async markRequirementCompleted(requirementId: string) {
    const [req] = await this.db.select().from(careRequirements).where(eq(careRequirements.id, requirementId));
    if (!req) {
      throw new NotFoundException(`Requirement ${requirementId} not found`);
    }

    return this.db.transaction(async (tx) => {
      const [updatedReq] = await tx.update(careRequirements)
        .set({ status: 'COMPLETED', updatedAt: new Date() })
        .where(eq(careRequirements.id, requirementId))
        .returning();

      // Check if ALL requirements for this bundle are completed
      const allReqs = await tx.select().from(careRequirements).where(eq(careRequirements.careBundleId, req.careBundleId));
      const allCompleted = allReqs.every(r => r.status === 'COMPLETED');

      if (allCompleted) {
         // Auto-complete the journey
         const [journey] = await tx.select().from(careJourneys).where(eq(careJourneys.careBundleId, req.careBundleId));
         if (journey && journey.status !== 'COMPLETED') {
           await tx.update(careJourneys)
             .set({ status: 'COMPLETED', updatedAt: new Date() })
             .where(eq(careJourneys.id, journey.id));
             
           await tx.insert(careJourneyEvents).values({
             journeyId: journey.id,
             stage: journey.currentStage,
             eventType: 'CARE_COMPLETED',
             metadata: {
                reason: 'All care requirements completed',
             }
           });
         }
      }

      return updatedReq;
    });
  }
}
