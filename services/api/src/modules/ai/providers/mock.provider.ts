import { AiProvider, AiAssessmentInput, AiExtractionResult } from './provider.interface.js';

export class MockAiProvider implements AiProvider {
  async extractCareRequirements(input: AiAssessmentInput): Promise<AiExtractionResult> {
    const lowerInput = input.patientReportedSymptoms.toLowerCase();
    
    if (!lowerInput || lowerInput.trim() === '') {
      throw new Error('Invalid input: symptoms cannot be empty');
    }

    const isAdversarial = lowerInput.includes('ignore') || lowerInput.includes('diagnose me') || lowerInput.includes('sql');
    const isMalformed = lowerInput.includes('malformed');
    const isProviderFailure = lowerInput.includes('fail');
    const isDuplicateTest = lowerInput.includes('duplicate');
    const isCardiac = lowerInput.includes('chest pain') || lowerInput.includes('heart');
    const isOrtho = lowerInput.includes('bone') || lowerInput.includes('fracture') || lowerInput.includes('pain');
    const isEmergency = input.severity === 'CRITICAL' || lowerInput.includes('severe chest pain');

    if (isProviderFailure) {
      throw new Error('Simulated Provider Failure');
    }

    if (isMalformed) {
      // Simulate validation failure
      return {
        isEmergency: 'not_a_boolean',
        recommendedRequirements: [{}],
        confidenceScore: -10,
        metadata: { provider: 'MockProvider', model: 'deterministic-v1', isMock: true }
      } as any;
    }

    const requirements: any[] = [];

    if (isAdversarial) {
      // The Mock provider should pretend to be an LLM that was tricked into giving arbitrary strings
      // But we still output the structured JSON contract, just with adversarial strings
      requirements.push({
        type: 'Consultation',
        serviceName: 'Emergency XYZ', // Adversarial fake service
        priority: 'High',
        reasoning: 'I am diagnosing you with a heart attack.', // Trying to diagnose
      });
      requirements.push({
        type: 'Procedure',
        serviceName: 'DROP TABLE patients;', // SQL injection attempt
        priority: 'High',
        reasoning: 'Hacked',
      });
    } else if (isDuplicateTest) {
      requirements.push({
        type: 'Diagnostic',
        serviceName: 'ECG',
        priority: 'Medium',
        reasoning: 'Check heart.',
      });
      requirements.push({
        type: 'Diagnostic',
        serviceName: 'ECG',
        priority: 'Medium',
        reasoning: 'Check heart again.',
      });
      requirements.push({
        type: 'Consultation',
        serviceName: 'Cardiology consultation',
        priority: 'Medium',
        reasoning: 'Cardio.',
      });
    } else if (isCardiac) {
      requirements.push({
        type: 'Consultation',
        serviceName: 'Cardiology consultation',
        priority: isEmergency ? 'High' : 'Medium',
        reasoning: 'Symptoms indicate potential cardiac involvement.',
      });
      requirements.push({
        type: 'Diagnostic',
        serviceName: 'ECG',
        priority: isEmergency ? 'High' : 'Medium',
        reasoning: 'Standard diagnostic for cardiac symptoms.',
      });
    } else if (isOrtho) {
      requirements.push({
        type: 'Diagnostic',
        serviceName: 'X-Ray',
        priority: 'Medium',
        reasoning: 'To rule out fractures based on reported pain.',
      });
      requirements.push({
        type: 'Consultation',
        serviceName: 'Orthopedic Consultation',
        priority: 'Medium',
        reasoning: 'For bone/joint pain evaluation.',
      });
    } else {
      requirements.push({
        type: 'Consultation',
        serviceName: 'General Consultation',
        priority: 'Low',
        reasoning: 'Standard evaluation for general symptoms.',
      });
    }

    return {
      isEmergency,
      recommendedRequirements: requirements,
      confidenceScore: 85,
      metadata: {
        provider: 'MockProvider',
        model: 'deterministic-v1',
        isMock: true,
      }
    };
  }
}
