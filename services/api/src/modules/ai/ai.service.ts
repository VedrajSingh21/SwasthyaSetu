import { Injectable, BadRequestException } from '@nestjs/common';
import { AiProvider, AiAssessmentInput, AiExtractionResult } from './providers/provider.interface.js';
import { MockAiProvider } from './providers/mock.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AiService {
  private readonly provider: AiProvider;

  constructor() {
    const aiProvider = process.env.AI_PROVIDER || 'mock';
    if (aiProvider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing. Cannot initialize GeminiProvider.');
      }
      this.provider = new GeminiProvider(apiKey);
    } else if (aiProvider === 'mock') {
      this.provider = new MockAiProvider();
    } else {
      throw new Error(`Unsupported AI_PROVIDER configuration: ${aiProvider}`);
    }
  }

  async extractCareRequirements(input: AiAssessmentInput): Promise<AiExtractionResult> {
    if (!input || !input.patientReportedSymptoms) {
      throw new BadRequestException('patientReportedSymptoms is required');
    }

    try {
      const result = await this.provider.extractCareRequirements(input);
      
      // Strict Validation
      if (!result || typeof result !== 'object') {
        throw new Error('AI returned an invalid object structure');
      }
      if (typeof result.isEmergency !== 'boolean') {
        throw new Error('Invalid or missing isEmergency flag');
      }
      if (typeof result.confidenceScore !== 'number' || result.confidenceScore < 0 || result.confidenceScore > 100) {
        throw new Error('Invalid confidence score');
      }
      if (!Array.isArray(result.recommendedRequirements)) {
        throw new Error('recommendedRequirements must be an array');
      }
      for (const req of result.recommendedRequirements) {
        if (!req || typeof req !== 'object') throw new Error('Requirement item must be an object');
        if (!['Consultation', 'Diagnostic', 'Procedure'].includes(req.type)) throw new Error('Invalid requirement type');
        if (typeof req.serviceName !== 'string' || req.serviceName.trim() === '') throw new Error('Invalid or empty serviceName');
        if (!['Low', 'Medium', 'High'].includes(req.priority)) throw new Error('Invalid priority');
        if (typeof req.reasoning !== 'string') throw new Error('Invalid reasoning');
      }

      return result;
    } catch (error: any) {
      throw new BadRequestException(`AI Extraction Failed: ${error.message}`);
    }
  }
}
