import { api } from '../api';

export interface CreateReferralRequest {
  patientId: string;
  careBundleId: string;
  destinationFacilityId: string;
  reason?: string;
}

export interface ReferralResponse {
  id: string;
  patientId: string;
  careBundleId: string;
  destinationFacilityId: string;
  status: string;
  priority: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export async function createReferral(data: CreateReferralRequest): Promise<ReferralResponse> {
  return api.post<ReferralResponse>('/referrals', data);
}
