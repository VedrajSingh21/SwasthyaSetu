import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CareReadinessService, BlockingReason } from '../care-readiness/care-readiness.service.js';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { referrals, referralEvents } from '../../database/schema/referrals.js';
import { careJourneys, careJourneyEvents } from '../../database/schema/journeys.js';

export interface RoutingCandidate {
  facilityId: string;
  facilityName: string;
  status: 'CARE_READY' | 'NOT_CARE_READY';
  readinessScore: number;
  blockingReasons: BlockingReason[];
}

export interface RoutingCandidatesResponse {
  bundle: {
    id: string;
    name: string;
  };
  candidates: RoutingCandidate[];
}

export interface RoutingRecommendationResponse {
  bundle: {
    id: string;
    name: string;
  };
  routingStatus: 'ROUTE_AVAILABLE' | 'NO_FEASIBLE_FACILITY';
  recommendation: {
    facilityId: string;
    facilityName: string;
    status: 'CARE_READY';
    readinessScore: number;
    reason: string;
  } | null;
  candidates: RoutingCandidate[];
}

export interface ReroutingResponse {
  routingStatus: 'CURRENT_ROUTE_STILL_VALID' | 'REROUTED' | 'NO_ALTERNATIVE_AVAILABLE';
  currentFacility: RoutingCandidate;
  alternative: {
    facilityId: string;
    facilityName: string;
    status: 'CARE_READY';
    readinessScore: number;
    reason: string;
  } | null;
  candidates: RoutingCandidate[];
}

export interface ReferralRecoveryResponse {
  recoveryStatus: 'CURRENT_ROUTE_STILL_VALID' | 'REROUTED' | 'NO_ALTERNATIVE_AVAILABLE';
  referralId: string;
  currentFacility?: RoutingCandidate;
  newFacility: RoutingCandidate | null;
  reason?: string;
}

@Injectable()
export class DynamicRoutingService {
  constructor(
    private readonly careReadinessService: CareReadinessService,
    @Inject(DATABASE_CONNECTION) private readonly db: PostgresJsDatabase<any>,
  ) {}

  async getRoutingCandidates(bundleId: string): Promise<RoutingCandidatesResponse> {
    // Reuse the multi-facility readiness evaluation
    const multiReadiness = await this.careReadinessService.getAllFacilitiesReadiness(bundleId);

    // Map to RoutingCandidate
    const candidates: RoutingCandidate[] = multiReadiness.facilities.map(facility => ({
      facilityId: facility.facilityId,
      facilityName: facility.facilityName,
      status: facility.status,
      readinessScore: facility.readinessScore,
      blockingReasons: facility.blockingReasons,
    }));

    return {
      bundle: {
        id: multiReadiness.bundle.id,
        name: multiReadiness.bundle.name,
      },
      candidates,
    };
  }

  async getRoutingRecommendation(bundleId: string): Promise<RoutingRecommendationResponse> {
    const candidateResponse = await this.getRoutingCandidates(bundleId);
    
    // Candidates are already deterministically ranked by getRoutingCandidates/CareReadinessService
    // We just find the first one that is CARE_READY
    const feasibleFacility = candidateResponse.candidates.find(c => c.status === 'CARE_READY');

    if (!feasibleFacility) {
      return {
        bundle: candidateResponse.bundle,
        routingStatus: 'NO_FEASIBLE_FACILITY',
        recommendation: null,
        candidates: candidateResponse.candidates,
      };
    }

    return {
      bundle: candidateResponse.bundle,
      routingStatus: 'ROUTE_AVAILABLE',
      recommendation: {
        facilityId: feasibleFacility.facilityId,
        facilityName: feasibleFacility.facilityName,
        status: feasibleFacility.status as 'CARE_READY',
        readinessScore: feasibleFacility.readinessScore,
        reason: 'CARE_READY',
      },
      candidates: candidateResponse.candidates,
    };
  }
  async getReroutingRecommendation(bundleId: string, currentFacilityId: string): Promise<ReroutingResponse> {
    const candidateResponse = await this.getRoutingCandidates(bundleId);
    
    const currentFacility = candidateResponse.candidates.find(c => c.facilityId === currentFacilityId);
    if (!currentFacility) {
      throw new NotFoundException(`Current facility ${currentFacilityId} not found in candidates`);
    }

    if (currentFacility.status === 'CARE_READY') {
      return {
        routingStatus: 'CURRENT_ROUTE_STILL_VALID',
        currentFacility,
        alternative: null,
        candidates: candidateResponse.candidates,
      };
    }

    // Exclude current facility and find the first CARE_READY alternative
    const feasibleAlternative = candidateResponse.candidates.find(
      c => c.facilityId !== currentFacilityId && c.status === 'CARE_READY'
    );

    if (!feasibleAlternative) {
      return {
        routingStatus: 'NO_ALTERNATIVE_AVAILABLE',
        currentFacility,
        alternative: null,
        candidates: candidateResponse.candidates,
      };
    }

    return {
      routingStatus: 'REROUTED',
      currentFacility,
      alternative: {
        facilityId: feasibleAlternative.facilityId,
        facilityName: feasibleAlternative.facilityName,
        status: feasibleAlternative.status as 'CARE_READY',
        readinessScore: feasibleAlternative.readinessScore,
        reason: 'CARE_READY',
      },
      candidates: candidateResponse.candidates,
    };
  }
  async recoverReferral(referralId: string): Promise<ReferralRecoveryResponse> {
    const [referral] = await this.db.select().from(referrals).where(eq(referrals.id, referralId));
    if (!referral) {
      throw new NotFoundException(`Referral ${referralId} not found`);
    }
    if (!referral.careBundleId) {
      throw new Error('Referral has no associated Care Bundle');
    }
    if (!referral.destinationFacilityId) {
      throw new Error('Referral has no current destination facility');
    }

    const rerouteRes = await this.getReroutingRecommendation(referral.careBundleId, referral.destinationFacilityId);

    if (rerouteRes.routingStatus === 'CURRENT_ROUTE_STILL_VALID') {
      return {
        recoveryStatus: 'CURRENT_ROUTE_STILL_VALID',
        referralId,
        currentFacility: rerouteRes.currentFacility,
        newFacility: null,
      };
    }

    if (rerouteRes.routingStatus === 'NO_ALTERNATIVE_AVAILABLE' || !rerouteRes.alternative) {
      return {
        recoveryStatus: 'NO_ALTERNATIVE_AVAILABLE',
        referralId,
        currentFacility: rerouteRes.currentFacility,
        newFacility: null,
      };
    }

    // Reroute possible. Start transaction to update referral and create events
    await this.db.transaction(async (tx) => {
      // Update referral
      await tx.update(referrals)
        .set({
          status: 'REROUTED',
          destinationFacilityId: rerouteRes.alternative!.facilityId,
          updatedAt: new Date(),
        })
        .where(eq(referrals.id, referralId));

      // Create referral event
      await tx.insert(referralEvents).values({
        referralId,
        eventType: 'REROUTED',
        previousStatus: referral.status,
        newStatus: 'REROUTED',
        metadata: {
          previousFacilityId: referral.destinationFacilityId,
          newFacilityId: rerouteRes.alternative!.facilityId,
          reason: 'CURRENT_FACILITY_NOT_CARE_READY',
        },
      });

      // Find if care journey exists for this patient and care bundle
      const [journey] = await tx.select().from(careJourneys)
        .where(
          and(
            eq(careJourneys.patientId, referral.patientId),
            eq(careJourneys.careBundleId, referral.careBundleId)
          )
        );

      if (journey) {
        // Create care journey event
        await tx.insert(careJourneyEvents).values({
          journeyId: journey.id,
          stage: journey.currentStage,
          eventType: 'ROUTE_CHANGED',
          metadata: {
            referralId,
            previousFacilityId: referral.destinationFacilityId,
            newFacilityId: rerouteRes.alternative!.facilityId,
            reason: 'CURRENT_FACILITY_NOT_CARE_READY',
          },
        });
      }
    });

    return {
      recoveryStatus: 'REROUTED',
      referralId,
      currentFacility: rerouteRes.currentFacility,
      newFacility: rerouteRes.alternative as unknown as RoutingCandidate,
      reason: 'CURRENT_FACILITY_NOT_CARE_READY',
    };
  }
}
