import type { 
  Patient, Facility, CareBundle, CareRequirement, 
  CareReadiness, CareJourney, DistrictBottleneck 
} from "@swasthyasetu/types";

// NOTE: All data here is SIMULATED DEMO DATA. 
// Never present this as real-time or real hospital availability.

export const mockPatients: Patient[] = [
  { id: "p1", name: "Ramesh Kumar", age: 54, gender: "Male", contact: "+91-9876543210", district: "Pune" },
  { id: "p2", name: "Sita Devi", age: 42, gender: "Female", contact: "+91-9876543211", district: "Pune" },
];

export const mockFacilities: Facility[] = [
  { id: "f1", name: "District Hospital Pune", district: "Pune", type: "DH", distance: 12 },
  { id: "f2", name: "Kothrud PHC", district: "Pune", type: "PHC", distance: 3 },
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
    overallReadinessStatus: "Not fully care-ready",
    estimatedWaitTime: 120,
  },
  {
    facilityId: "f3",
    readinessScore: 92,
    specialistAvailability: true,
    diagnosticAvailability: true,
    appointmentAvailability: true,
    facilityCapacity: 5,
    overallReadinessStatus: "Care Ready",
    estimatedWaitTime: 45,
  }
];

export const mockCareJourney: CareJourney = {
  id: "j1",
  patientId: "p1",
  steps: [
    { id: "s1", title: "Assessment", status: "Completed", description: "Initial triage completed at PHC" },
    { id: "s2", title: "Care Requirement", status: "Completed", description: "Cardiology Evaluation Bundle identified" },
    { id: "s3", title: "Referral", status: "Active", description: "Finding Care Ready facility" },
    { id: "s4", title: "Appointment", status: "Pending" },
    { id: "s5", title: "Diagnostics", status: "Pending" },
    { id: "s6", title: "Treatment", status: "Pending" },
    { id: "s7", title: "Follow-up", status: "Pending" },
  ]
};

export const mockDistrictBottlenecks: DistrictBottleneck[] = [
  {
    id: "db1",
    district: "Pune",
    issue: "Cardiology referrals delayed",
    affectedPercentage: 38,
    primaryBottleneck: "Specialist capacity",
    recommendedAction: "Increase cardiology referral capacity at Facility X"
  },
  {
    id: "db2",
    district: "Pune",
    issue: "Diagnostics incomplete",
    affectedPercentage: 27,
    primaryBottleneck: "ECG availability",
    recommendedAction: "Repair ECG machine at District Hospital"
  }
];
