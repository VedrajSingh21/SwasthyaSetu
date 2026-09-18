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

export interface FacilityReadinessResponse {
  facilityId: string;
  facilityName: string;
  bundleId?: string;
  bundleName?: string;
  status: 'CARE_READY' | 'NOT_CARE_READY';
  readinessScore: number;
  requirements: RequirementReadiness[];
  blockingReasons: BlockingReason[];
}

export interface MultiFacilityReadinessResponse {
  bundle: {
    id: string;
    name: string;
  };
  facilities: FacilityReadinessResponse[];
}

export const getFacilityCareReadiness = (facilityId: string, bundleId: string) => 
  api.get<FacilityReadinessResponse>(`/care-readiness/facility/${facilityId}/bundle/${bundleId}`);

export const getBundleCareReadiness = (bundleId: string) => 
  api.get<MultiFacilityReadinessResponse>(`/care-readiness/bundle/${bundleId}/facilities`);
