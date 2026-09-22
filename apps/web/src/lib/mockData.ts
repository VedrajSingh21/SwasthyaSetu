import type { 
  Patient, Facility, CareBundle, CareRequirement, 
  CareReadiness, CareJourney, DistrictBottleneck, Referral
} from "@swasthyasetu/types";

// NOTE: All data here is SIMULATED DEMO DATA. 
// Never present this as real-time or real hospital availability.

export const mockPatients: Patient[] = [
  { id: "p1", name: "Ramesh Kumar", age: 54, gender: "Male", contact: "+91-9876543210", district: "Pune" },
  { id: "p2", name: "Sita Devi", age: 42, gender: "Female", contact: "+91-9876543211", district: "Pune" },
];

export const mockFacilities: Facility[] = [
  {
    id: "fac-1",
    name: "District Hospital Central",
    district: "Central",
    type: "DH",
    distance: 12
  },
  {
    id: "fac-2",
    name: "Community Health Center North",
    district: "North",
    type: "CHC",
    distance: 5
  },
  { id: "f3", name: "Sassoon General Hospital", district: "Pune", type: "Specialty", distance: 15 },
];

export const mockCareRequirements: CareRequirement[] = [
  { id: "cr1", type: "Consultation", name: "Cardiologist Consultation", specialty: "Cardiology" },
  { id: "cr2", type: "Diagnostic", name: "ECG", specialty: "Cardiology" },
  { id: "cr3", type: "Diagnostic", name: "Blood Test - Lipid Profile", specialty: "General" },
];

export const mockCareBundles: CareBundle[] = [
  {
    id: "cb1",
    title: "Cardiology Evaluation",
    requirements: mockCareRequirements,
    priority: "High",
    estimatedVisits: 1,
  }
];

export const mockCareReadiness: CareReadiness[] = [
  {
    facilityId: "f1",
    readinessScore: 61,
    specialistAvailability: true,
    diagnosticAvailability: false,
    appointmentAvailability: true,
    facilityCapacity: 10,
    overallReadinessStatus: "NOT CARE-READY",
    estimatedWaitTime: 120,
  },
  {
    facilityId: "f3",
    readinessScore: 92,
    specialistAvailability: true,
    diagnosticAvailability: true,
    appointmentAvailability: true,
    facilityCapacity: 5,
    overallReadinessStatus: "CARE READY",
    estimatedWaitTime: 45,
  }
];

export const mockCareJourney: CareJourney = {
  id: "j1",
  patientId: "p1",
  currentStage: "REFERRAL",
  status: "ACTIVE",
  events: [],
  requirements: []
};

export const mockReferrals: Referral[] = [
  {
    id: "ref-1024",
    patientId: "p1",
    sourceFacilityId: "f2", // PHC
    targetFacilityId: "f1", // DH
    careBundleId: "cb1",
    status: "PENDING",
    date: new Date().toISOString(),
    priority: "High",
    completedServices: []
  },
  {
    id: "ref-1025",
    patientId: "p2",
    sourceFacilityId: "f2", // PHC
    targetFacilityId: "f1", // DH
    careBundleId: "cb1",
    status: "ACCEPTED",
    date: new Date().toISOString(),
    priority: "Medium",
    completedServices: []
  }
];

export const mockDistrictBottlenecks: DistrictBottleneck[] = [
  {
    id: "db1",
    district: "Pune",
    issue: "CARDIOLOGY REFERRALS",
    affectedPercentage: 38,
    primaryBottleneck: "Specialist capacity",
    affectedFacilities: ["Kothrud PHC", "Rural Hospital B"],
    impact: "High",
    impactedReferrals: 24,
    currentState: "DELAYED",
    affectedServices: ["Cardiology Consultation"],
    recommendedAction: "Route new cardiology referrals to facilities with available specialist capacity."
  },
  {
    id: "db2",
    district: "Pune",
    issue: "DIAGNOSTICS",
    affectedPercentage: 27,
    primaryBottleneck: "ECG unavailable",
    affectedFacilities: ["Rural Hospital B", "Facility C"],
    impact: "High",
    impactedReferrals: 14,
    currentState: "BLOCKED",
    affectedServices: ["Cardiology + ECG + Blood Test"],
    recommendedAction: "Route ECG-dependent Care Bundles to care-ready facilities."
  }
];
