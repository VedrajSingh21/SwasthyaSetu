import { api } from '../api';
import type { Patient, CareBundle, Referral, CareJourney } from '@swasthyasetu/types';

export const getPatient = (patientId: string) => 
  api.get<Patient>(`/patients/${patientId}`);

export const getPatientCareBundles = (patientId: string) => 
  api.get<CareBundle[]>(`/patients/${patientId}/care-bundles`);

export const getPatientReferrals = (patientId: string) => 
  api.get<Referral[]>(`/patients/${patientId}/referrals`);

export const getPatientJourneys = (patientId: string) => 
  api.get<CareJourney[]>(`/patients/${patientId}/journeys`);
