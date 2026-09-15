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
  overallReadinessStatus: "Care Ready" | "Not fully care-ready" | "Not ready";
  estimatedWaitTime: number; // in minutes
}

export interface Referral {
  id: string;
  patientId: string;
  sourceFacilityId: string;
  targetFacilityId: string;
  careBundleId: string;
  status: "Pending" | "Accepted" | "Completed" | "Blocked";
  date: string;
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
  recommendedAction: string;
}
