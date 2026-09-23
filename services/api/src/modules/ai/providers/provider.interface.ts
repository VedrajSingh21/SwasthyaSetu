export interface AiAssessmentInput {
  patientReportedSymptoms: string;
  duration?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  additionalContext?: string;
}

export interface ExtractedCareRequirement {
  type: 'Consultation' | 'Diagnostic' | 'Procedure';
  serviceName: string;
  priority: 'Low' | 'Medium' | 'High';
  reasoning: string;
}

export interface AiExtractionResult {
  isEmergency: boolean;
  recommendedRequirements: ExtractedCareRequirement[];
  confidenceScore: number;
  metadata: {
    provider: string;
    model: string;
    isMock: boolean;
  };
}

export interface AiProvider {
  extractCareRequirements(input: AiAssessmentInput): Promise<AiExtractionResult>;
  generateText(prompt: string): Promise<string>;
  chat(messages: any[], tools: any[]): Promise<any>;
}
