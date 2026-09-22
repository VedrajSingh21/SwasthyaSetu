import { api } from '../api';

export interface RequirementReadiness {
  serviceId: string;
  serviceName: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'CAPACITY_FULL' | 'NO_CAPACITY_DATA';
  capacity?: {
    capacity: number;
    currentLoad: number;
    remaining: number;
  };
}

export interface BlockingReason {
  code: 'SERVICE_UNAVAILABLE' | 'CAPACITY_FULL' | 'NO_CAPACITY_DATA';
  serviceId: string;
  serviceName: string;
  message: string;
}

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

export const dynamicRoutingApi = {
  getCandidates: (bundleId: string) => 
    api.get<RoutingCandidatesResponse>(`/dynamic-routing/bundle/${bundleId}/candidates`),
    
  getRecommendation: (bundleId: string) => 
    api.get<RoutingRecommendationResponse>(`/dynamic-routing/bundle/${bundleId}/recommendation`),
    
  getReroute: (bundleId: string, currentFacilityId: string) => 
    api.get<ReroutingResponse>(`/dynamic-routing/bundle/${bundleId}/reroute/${currentFacilityId}`),
    
  recoverReferral: (referralId: string) => 
    api.post<ReferralRecoveryResponse>(`/dynamic-routing/referrals/${referralId}/recover`, {}),
};
