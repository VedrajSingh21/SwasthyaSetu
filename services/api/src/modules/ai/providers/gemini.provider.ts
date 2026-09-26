import { AiProvider, AiAssessmentInput, AiExtractionResult, ExtractedCareRequirement } from './provider.interface.js';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export class GeminiProvider implements AiProvider {
  private ai: GoogleGenAI;
  private modelName: string;
  
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('MODEL_API_KEY is required to initialize GeminiProvider');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = process.env.MODEL_NAME || 'gemini-2.5-flash';
  }

  async extractCareRequirements(input: AiAssessmentInput): Promise<AiExtractionResult> {
    const prompt = `You are an AI assistant in a healthcare routing system. 
Your sole task is to convert patient-reported information into structured potential care requirements.

CRITICAL RULES:
1. DO NOT diagnose disease.
2. DO NOT prescribe medication or recommend treatments.
3. DO NOT determine definitive medical urgency.
4. DO NOT select a hospital or facility.
5. You are only extracting standard healthcare service requirements (e.g. 'Cardiologist Consultation', 'ECG', 'X-Ray').

Patient Reported Symptoms: ${input.patientReportedSymptoms}
Duration: ${input.duration || 'Not provided'}
Severity: ${input.severity || 'Not provided'}
Additional Context: ${input.additionalContext || 'None'}
`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        isEmergency: {
          type: Type.BOOLEAN,
          description: "True if the symptoms indicate a potential emergency requiring immediate attention."
        },
        recommendedRequirements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                enum: ['Consultation', 'Diagnostic', 'Procedure'],
              },
              serviceName: {
                type: Type.STRING,
                description: "Name of the required service (e.g., 'Cardiologist Consultation', 'ECG')"
              },
              priority: {
                type: Type.STRING,
                enum: ['Low', 'Medium', 'High'],
              },
              reasoning: {
                type: Type.STRING,
                description: "Brief reason why this service is required based on symptoms."
              }
            },
            required: ['type', 'serviceName', 'priority', 'reasoning']
          }
        },
        confidenceScore: {
          type: Type.INTEGER,
          description: "Confidence score of this extraction (0-100)."
        }
      },
      required: ['isEmergency', 'recommendedRequirements', 'confidenceScore']
    };

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1,
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('LLM returned empty response');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(resultText);
    } catch (e) {
      throw new Error('LLM returned invalid JSON');
    }

    // Validation
    if (typeof parsed.isEmergency !== 'boolean') throw new Error('Missing or invalid isEmergency flag');
    if (!Array.isArray(parsed.recommendedRequirements)) throw new Error('Missing or invalid recommendedRequirements array');
    if (typeof parsed.confidenceScore !== 'number') throw new Error('Missing or invalid confidenceScore');

    const mappedRequirements: ExtractedCareRequirement[] = parsed.recommendedRequirements.map((req: any) => {
      if (!['Consultation', 'Diagnostic', 'Procedure'].includes(req.type)) {
        throw new Error(`Invalid requirement type: ${req.type}`);
      }
      if (!['Low', 'Medium', 'High'].includes(req.priority)) {
        throw new Error(`Invalid requirement priority: ${req.priority}`);
      }
      if (!req.serviceName || typeof req.serviceName !== 'string') {
        throw new Error('Invalid or missing serviceName');
      }
      if (!req.reasoning || typeof req.reasoning !== 'string') {
        throw new Error('Invalid or missing reasoning');
      }
      return {
        type: req.type as any,
        serviceName: req.serviceName,
        priority: req.priority as any,
        reasoning: req.reasoning
      };
    });

    return {
      isEmergency: parsed.isEmergency,
      recommendedRequirements: mappedRequirements,
      confidenceScore: parsed.confidenceScore,
      metadata: {
        provider: 'gemini',
        model: this.modelName,
        isMock: false,
      }
    };
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
    });
    
    return response.text || '';
  }

  async chat(messages: any[], tools: any[]): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: messages,
      config: {
        tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
      }
    });

    return response;
  }
}
