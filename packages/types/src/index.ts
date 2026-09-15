export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  district: string;
}

export interface Facility {
  id: string;
  name: string;
  district: string;
  type: "PHC" | "CHC" | "DH" | "Specialty";
  distance: number; // in km
}

export interface CareRequirement {
  id: string;
  type: "Consultation" | "Diagnostic" | "Procedure";
  name: string;
  specialty: string;
}

export interface CareBundle {
  id: string;
  title: string;
  requirements: CareRequirement[];
  priority: "High" | "Medium" | "Low";
  estimatedVisits: number;
}

export interface CareReadiness {
  facilityId: string;
  readinessScore: number; // 0 to 100
  specialistAvailability: boolean;
  diagnosticAvailability: boolean;
  appointmentAvailability: boolean;
  facilityCapacity: number; // e.g., beds or slots available
  overallReadinessStatus: "CARE READY" | "NOT CARE-READY" | "BLOCKED";
  estimatedWaitTime: number; // in minutes
}

export type ReferralStatus = 
  | "Pending" 
  | "Pending Review"
  | "Accepted" 
  | "Appointment Confirmed"
  | "In Care"
  | "CARE COMPLETED"
  | "Follow-up Pending"
  | "REROUTED — ALTERNATIVE FOUND"
  | "Cannot Fulfil"
  | "Completed" 
  | "Blocked";

export interface Referral {
  id: string;
  patientId: string;
  sourceFacilityId: string;
  targetFacilityId: string;
  careBundleId: string;
  status: ReferralStatus;
  date: string;
  priority?: "High" | "Medium" | "Low";
  completedServices?: string[]; // IDs of CareRequirements that are completed
}

export interface Appointment {
  id: string;
  patientId: string;
  facilityId: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Missed";
}

export interface Diagnostic {
  id: string;
  name: string;
  status: "Pending" | "Completed";
  result?: string;
}

export interface CareJourney {
  id: string;
  patientId: string;
  steps: {
    id: string;
    title: string;
    status: "Completed" | "Active" | "Pending" | "Blocked";
    description?: string;
  }[];
}

export interface FollowUp {
  id: string;
  patientId: string;
  facilityId: string;
  dueDate: string;
  status: "Pending" | "Completed" | "Missed";
}

export interface DistrictBottleneck {
  id: string;
  district: string;
  issue: string;
  affectedPercentage: number;
  primaryBottleneck: string;
  affectedFacilities: string[];
  impact: "High" | "Medium" | "Low";
  impactedReferrals: number;
  currentState: "BLOCKED" | "DELAYED" | "AT RISK";
  affectedServices: string[];
  recommendedAction: string;
}
