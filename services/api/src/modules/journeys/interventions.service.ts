import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { referrals, referralEvents } from '../../database/schema/referrals.js';
import { careJourneys, careJourneyEvents, followUps } from '../../database/schema/journeys.js';
import { careRequirements } from '../../database/schema/care.js';
import { eq, and, inArray } from 'drizzle-orm';

export const INTERVENTION_THRESHOLDS = {
  referralNotReachedHours: 24,
  consultationWaitHours: 2,
  diagnosticsPendingHours: 48,
};

export type StuckJourneyIntervention = {
  journeyId?: string;
  patientId?: string;
  referralId?: string;
  currentStage?: string;
  interventionType: 'REFERRAL_NOT_REACHED' | 'WAITING_FOR_CONSULTATION' | 'DIAGNOSTICS_PENDING' | 'FOLLOW_UP_OVERDUE';
  reason: string;
  detectedAt: Date;
  relevantEventTime?: Date;
  recommendedAction: string;
};

@Injectable()
export class InterventionsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: PostgresJsDatabase<Record<string, unknown>>) {}

  async getStuckJourneys(): Promise<StuckJourneyIntervention[]> {
    const interventions: StuckJourneyIntervention[] = [];
    const now = new Date();

    // 1. Rule A - REFERRAL_NOT_REACHED
    const acceptedRefs = await this.db.select({
      referral: referrals,
      journey: careJourneys,
    })
    .from(referrals)
    .leftJoin(careJourneys, eq(careJourneys.careBundleId, referrals.careBundleId))
    .where(eq(referrals.status, 'ACCEPTED'));

    for (const row of acceptedRefs) {
      const { referral, journey } = row;
      const hasArrived = journey && ['ARRIVED', 'CONSULTATION', 'DIAGNOSTICS', 'TREATMENT', 'FOLLOW_UP'].includes(journey.currentStage as string);
      
      if (!hasArrived) {
        const events = await this.db.select()
          .from(referralEvents)
          .where(and(
            eq(referralEvents.referralId, referral.id),
            eq(referralEvents.newStatus, 'ACCEPTED')
          ));
        
        events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const acceptedEvent = events[0];
        
        const timestamp = acceptedEvent ? acceptedEvent.createdAt : referral.updatedAt;
        const hoursElapsed = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

        if (hoursElapsed > INTERVENTION_THRESHOLDS.referralNotReachedHours) {
          interventions.push({
            journeyId: journey?.id,
            patientId: referral.patientId,
            referralId: referral.id,
            currentStage: journey?.currentStage || undefined,
            interventionType: 'REFERRAL_NOT_REACHED',
            reason: `Referral was accepted but the patient has not arrived within the ${INTERVENTION_THRESHOLDS.referralNotReachedHours}h threshold.`,
            detectedAt: now,
            relevantEventTime: timestamp,
            recommendedAction: 'Contact ASHA / patient',
          });
        }
      }
    }

    // 2. Rule B - WAITING_FOR_CONSULTATION
    const arrivedJourneys = await this.db.select()
      .from(careJourneys)
      .where(eq(careJourneys.currentStage, 'ARRIVED'));

    for (const journey of arrivedJourneys) {
      if (journey.status === 'COMPLETED') continue;

      const events = await this.db.select()
        .from(careJourneyEvents)
        .where(and(
          eq(careJourneyEvents.journeyId, journey.id),
          eq(careJourneyEvents.stage, 'ARRIVED')
        ));
      
      events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const arrivedEvent = events[0];

      const timestamp = arrivedEvent ? arrivedEvent.createdAt : journey.updatedAt;
      const hoursElapsed = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed > INTERVENTION_THRESHOLDS.consultationWaitHours) {
        interventions.push({
          journeyId: journey.id,
          patientId: journey.patientId,
          currentStage: journey.currentStage || undefined,
          interventionType: 'WAITING_FOR_CONSULTATION',
          reason: `Patient has been in ARRIVED stage for more than ${INTERVENTION_THRESHOLDS.consultationWaitHours}h waiting for consultation.`,
          detectedAt: now,
          relevantEventTime: timestamp,
          recommendedAction: 'Check facility queue',
        });
      }
    }

    // 3. Rule C - DIAGNOSTICS_PENDING
    const pendingDiagnostics = await this.db.select({
      req: careRequirements,
      journey: careJourneys
    })
    .from(careRequirements)
    .innerJoin(careJourneys, eq(careJourneys.careBundleId, careRequirements.careBundleId))
    .where(and(
      eq(careRequirements.requirementType, 'Diagnostic'),
      inArray(careRequirements.status, ['REQUIRED', 'SCHEDULED', 'IN_PROGRESS', 'BLOCKED'])
    ));

    for (const row of pendingDiagnostics) {
      const { req, journey } = row;
      if (journey.status === 'COMPLETED') continue;
      
      const isPastConsultation = ['CONSULTATION', 'DIAGNOSTICS', 'TREATMENT', 'FOLLOW_UP'].includes(journey.currentStage as string);
      
      if (isPastConsultation) {
        const events = await this.db.select()
          .from(careJourneyEvents)
          .where(and(
             eq(careJourneyEvents.journeyId, journey.id),
             inArray(careJourneyEvents.stage, ['CONSULTATION', 'DIAGNOSTICS'])
          ));
        
        events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const startEvent = events[0];

        const timestamp = startEvent ? startEvent.createdAt : req.createdAt;
        const hoursElapsed = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

        if (hoursElapsed > INTERVENTION_THRESHOLDS.diagnosticsPendingHours) {
          interventions.push({
            journeyId: journey.id,
            patientId: journey.patientId,
            currentStage: journey.currentStage || undefined,
            interventionType: 'DIAGNOSTICS_PENDING',
            reason: `Diagnostic requirement pending for more than ${INTERVENTION_THRESHOLDS.diagnosticsPendingHours}h since consultation.`,
            detectedAt: now,
            relevantEventTime: timestamp,
            recommendedAction: 'Check diagnostic availability',
          });
        }
      }
    }

    // 4. Rule D - FOLLOW_UP_OVERDUE
    const overdueFollowUps = await this.db.select({
      followUp: followUps,
      journey: careJourneys
    })
    .from(followUps)
    .leftJoin(careJourneys, eq(careJourneys.careBundleId, followUps.careBundleId))
    .where(eq(followUps.status, 'PENDING'));

    for (const row of overdueFollowUps) {
      const { followUp, journey } = row;
      if (journey?.status === 'COMPLETED') continue;

      if (followUp.scheduledDate && followUp.scheduledDate < now) {
        interventions.push({
          journeyId: journey?.id,
          patientId: followUp.patientId,
          referralId: followUp.referralId || undefined,
          currentStage: journey?.currentStage || undefined,
          interventionType: 'FOLLOW_UP_OVERDUE',
          reason: `Follow-up scheduled for ${followUp.scheduledDate.toISOString()} is overdue.`,
          detectedAt: now,
          relevantEventTime: followUp.scheduledDate,
          recommendedAction: 'Contact patient / ASHA',
        });
      }
    }

    // Sort deterministically
    interventions.sort((a, b) => {
      if (a.interventionType !== b.interventionType) {
        return a.interventionType.localeCompare(b.interventionType);
      }
      const timeA = a.relevantEventTime?.getTime() || 0;
      const timeB = b.relevantEventTime?.getTime() || 0;
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      const idA = a.journeyId || '';
      const idB = b.journeyId || '';
      return idA.localeCompare(idB);
    });

    return interventions;
  }
}
