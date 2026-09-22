import { api } from '../api';

export interface InboundReferral {
  id: string;
  patientId: string;
  careBundleId: string;
  destinationFacilityId: string;
  priority: string;
  status: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    name: string;
    gender: string;
  };
  bundle?: {
    title: string;
  };
}

export const facilityApi = {
  getFacilityReferrals: (facilityId: string) => {
    return api.get<InboundReferral[]>(`/facilities/${facilityId}/referrals`);
  },
  
  updateReferralStatus: (referralId: string, status: 'ACCEPTED' | 'COMPLETED') => {
    return api.patch<{ id: string; status: string }>(`/referrals/${referralId}/status`, { status });
  }
};
