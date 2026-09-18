import { api } from '../api';

export interface ProcessAssessmentPayload {
  patientId: string;
  patientReportedSymptoms: string;
  duration?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  additionalContext?: string;
}

export interface AssessmentResponse {
  assessment: {
    id: string;
    patientId: string;
    status: string;
    [key: string]: any;
  };
  careBundle: {
    id: string;
    title: string;
    priority: string;
    status: string;
    [key: string]: any;
  };
  requirements: Array<{
    id: string;
    name: string;
    requirementType: string;
    priority: string;
    [key: string]: any;
  }>;
}

export const processAssessment = (payload: ProcessAssessmentPayload) => 
  api.post<AssessmentResponse>('/assessments/process', payload);
