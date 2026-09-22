import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, asc } from 'drizzle-orm';
import { careJourneys, careJourneyEvents, followUps } from '../../database/schema/journeys.js';
import { careRequirements } from '../../database/schema/care.js';
import { referrals } from '../../database/schema/referrals.js';

@Injectable()
export class JourneysService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: PostgresJsDatabase<Record<string, unknown>>) {}

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

    const requirements = journey.careBundleId 
      ? await this.db.select().from(careRequirements).where(eq(careRequirements.careBundleId, journey.careBundleId))
      : [];

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

type JourneyStage = 'ASSESSMENT' | 'REFERRAL' | 'APPOINTMENT' | 'ARRIVED' | 'CONSULTATION' | 'DIAGNOSTICS' | 'TREATMENT' | 'FOLLOW_UP';

    // Proceed with transition
    return this.db.transaction(async (tx) => {
      const [updated] = await tx.update(careJourneys)
        .set({ currentStage: requestedStage as JourneyStage, updatedAt: new Date() })
        .where(eq(careJourneys.id, journeyId))
        .returning();

      await tx.insert(careJourneyEvents).values({
        journeyId: journeyId,
        stage: requestedStage as JourneyStage,
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

      await this._checkAndAdvanceJourneyCompletion(tx, req.careBundleId);

      return updatedReq;
    });
  }

  async completeFollowUp(followUpId: string) {
    const [followUp] = await this.db.select().from(followUps).where(eq(followUps.id, followUpId));
    if (!followUp) throw new NotFoundException(`Follow-up ${followUpId} not found`);
    if (followUp.status === 'COMPLETED') throw new BadRequestException('Follow-up is already completed');

    return this.db.transaction(async (tx) => {
      const [updatedFollowUp] = await tx.update(followUps)
        .set({ status: 'COMPLETED', completedAt: new Date(), updatedAt: new Date() })
        .where(eq(followUps.id, followUpId))
        .returning();

      if (followUp.careBundleId) {
        const reqs = await tx.select().from(careRequirements).where(eq(careRequirements.careBundleId, followUp.careBundleId));
        const followUpReq = reqs.find(r => r.requirementType === 'Follow-up');
        if (followUpReq && followUpReq.status !== 'COMPLETED') {
           await tx.update(careRequirements)
             .set({ status: 'COMPLETED', updatedAt: new Date() })
             .where(eq(careRequirements.id, followUpReq.id));
        }
        await this._checkAndAdvanceJourneyCompletion(tx, followUp.careBundleId);
      }
      return {
        id: updatedFollowUp.id,
        patientId: updatedFollowUp.patientId,
        journeyId: (await tx.select({ id: careJourneys.id }).from(careJourneys).where(eq(careJourneys.careBundleId, followUp.careBundleId!)))[0]?.id,
        careBundleId: updatedFollowUp.careBundleId,
        scheduledDate: updatedFollowUp.scheduledDate,
        status: updatedFollowUp.status,
        completedAt: updatedFollowUp.completedAt
      };
    });
  }

  private async _checkAndAdvanceJourneyCompletion(tx: any, careBundleId: string) {
    const allReqs = await tx.select().from(careRequirements).where(eq(careRequirements.careBundleId, careBundleId));
    
    const followUpReq = allReqs.find((r: any) => r.requirementType === 'Follow-up');
    const nonFollowUpReqs = allReqs.filter((r: any) => r.requirementType !== 'Follow-up');
    const allNonFollowUpCompleted = nonFollowUpReqs.every((r: any) => r.status === 'COMPLETED');

    if (allNonFollowUpCompleted) {
      const [journey] = await tx.select().from(careJourneys).where(eq(careJourneys.careBundleId, careBundleId));
      if (!journey || journey.status === 'COMPLETED') return;

      if (followUpReq && followUpReq.status !== 'COMPLETED') {
        const existingFollowUp = await tx.select().from(followUps).where(eq(followUps.careBundleId, careBundleId));
        
        if (existingFollowUp.length === 0) {
           const [referral] = await tx.select().from(referrals).where(eq(referrals.careBundleId, careBundleId));
           
           await tx.insert(followUps).values({
             patientId: journey.patientId,
             careBundleId,
             referralId: referral?.id,
             status: 'PENDING',
             scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
           });

           if (journey.currentStage !== 'FOLLOW_UP') {
             await tx.update(careJourneys)
               .set({ currentStage: 'FOLLOW_UP', updatedAt: new Date() })
               .where(eq(careJourneys.id, journey.id));
               
             await tx.insert(careJourneyEvents).values({
               journeyId: journey.id,
               stage: 'FOLLOW_UP',
               eventType: 'STAGE_ADVANCED',
               metadata: { reason: 'All treatments completed, scheduling follow-up' }
             });
           }
        }
      } else {
        await tx.update(careJourneys)
          .set({ status: 'COMPLETED', updatedAt: new Date() })
          .where(eq(careJourneys.id, journey.id));
          
        await tx.insert(careJourneyEvents).values({
          journeyId: journey.id,
          stage: journey.currentStage,
          eventType: 'CARE_COMPLETED',
          metadata: { reason: 'All care requirements completed' }
        });
      }
    }
  }
}
