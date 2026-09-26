import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../database/schema/index.js';
import { eq } from 'drizzle-orm';

export interface ProcessAssessmentInput {
  patientId: string;
  patientReportedSymptoms: string;
  duration?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  additionalContext?: string;
}

@Injectable()
export class AssessmentsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly aiService: AiService
  ) {}

  async processAssessment(input: ProcessAssessmentInput) {
    if (!input.patientId) {
      throw new BadRequestException('patientId is required');
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(input.patientId)) {
      throw new BadRequestException('Invalid patientId UUID format');
    }
    if (!input.patientReportedSymptoms) {
      throw new BadRequestException('patientReportedSymptoms is required');
    }

    const patientResult = await this.db.select().from(schema.patients).where(eq(schema.patients.id, input.patientId)).limit(1);
    if (patientResult.length === 0) {
      throw new NotFoundException('Patient not found');
    }

    const [assessment] = await this.db.insert(schema.assessments).values({
      patientId: input.patientId,
      source: 'APP',
      rawInput: {
        symptoms: input.patientReportedSymptoms,
        duration: input.duration,
        severity: input.severity,
        additionalContext: input.additionalContext,
      },
      status: 'PROCESSING'
    }).returning();

    let aiResult;
    try {
      aiResult = await this.aiService.extractCareRequirements({
        patientReportedSymptoms: input.patientReportedSymptoms,
        duration: input.duration,
        severity: input.severity,
        additionalContext: input.additionalContext,
      });
    } catch (err: any) {
      await this.db.update(schema.assessments).set({ status: 'FAILED' }).where(eq(schema.assessments.id, assessment.id));
      throw err;
    }

    const uniqueReqsMap = new Map<string, any>();
    for (const req of aiResult.recommendedRequirements) {
      const key = req.serviceName.trim().toUpperCase();
      if (!uniqueReqsMap.has(key)) {
        uniqueReqsMap.set(key, req);
      }
    }
    const uniqueRequirements = Array.from(uniqueReqsMap.values());

    const allServices = await this.db.select().from(schema.services).where(eq(schema.services.active, true));

    const mappedRequirements: any[] = [];
    const unmappedRequirements: any[] = [];

    for (const req of uniqueRequirements) {
      const normalizedReqName = req.serviceName.trim().toLowerCase();
      
      // 1. Exact match
      let matchedService = allServices.find(s => s.name.trim().toLowerCase() === normalizedReqName);

      // 2. Substring / contains match
      if (!matchedService) {
        matchedService = allServices.find(s => {
          const sName = s.name.trim().toLowerCase();
          return sName.includes(normalizedReqName) || normalizedReqName.includes(sName);
        });
      }

      // 3. Clinical domain synonyms
      if (!matchedService) {
        if (normalizedReqName.includes('cardio') || normalizedReqName.includes('heart')) {
          matchedService = allServices.find(s => s.name.toLowerCase().includes('cardio'));
        } else if (normalizedReqName.includes('ecg') || normalizedReqName.includes('electrocardio')) {
          matchedService = allServices.find(s => s.name.toLowerCase().includes('ecg'));
        } else if (normalizedReqName.includes('blood') || normalizedReqName.includes('cbc') || normalizedReqName.includes('investigation') || normalizedReqName.includes('lab')) {
          matchedService = allServices.find(s => s.name.toLowerCase().includes('blood'));
        } else if (normalizedReqName.includes('ortho') || normalizedReqName.includes('bone')) {
          matchedService = allServices.find(s => s.name.toLowerCase().includes('ortho'));
        } else if (normalizedReqName.includes('x-ray') || normalizedReqName.includes('xray') || normalizedReqName.includes('radiology')) {
          matchedService = allServices.find(s => s.name.toLowerCase().includes('x-ray') || s.name.toLowerCase().includes('xray'));
        } else if (normalizedReqName.includes('follow') || normalizedReqName.includes('review')) {
          matchedService = allServices.find(s => s.name.toLowerCase().includes('follow'));
        }
      }

      // 4. Type fallback if unmapped
      if (!matchedService && allServices.length > 0) {
        matchedService = allServices.find(s => s.type === req.type);
      }

      if (matchedService) {
        mappedRequirements.push({
          aiRequirement: req,
          serviceId: matchedService.id,
          serviceName: matchedService.name,
          requirementType: matchedService.type,
          priority: req.priority,
        });
      } else {
        unmappedRequirements.push({
          ...req,
          reason: 'UNMAPPED_REQUIREMENT'
        });
      }
    }

    let careBundle;
    let createdRequirements: any[] = [];

    await this.db.transaction(async (tx) => {
      const [bundle] = await tx.insert(schema.careBundles).values({
        patientId: input.patientId,
        assessmentId: assessment.id,
        title: `Assessment Bundle - ${new Date().toISOString().split('T')[0]}`,
        priority: input.severity === 'CRITICAL' ? 'High' : 'Medium',
        status: mappedRequirements.length > 0 ? 'ACTIVE' : 'PENDING_REVIEW',
        source: 'LLM'
      }).returning();
      
      careBundle = bundle;

      if (mappedRequirements.length > 0) {
        createdRequirements = await tx.insert(schema.careRequirements).values(
          mappedRequirements.map((req, index) => ({
            careBundleId: bundle.id,
            serviceId: req.serviceId,
            requirementType: req.requirementType,
            name: req.serviceName,
            priority: req.priority,
            status: 'REQUIRED' as any,
            sequence: index + 1
          }))
        ).returning();
      }

      await tx.update(schema.assessments).set({ status: 'PROCESSED' }).where(eq(schema.assessments.id, assessment.id));
    });

    const [finalAssessment] = await this.db.select().from(schema.assessments).where(eq(schema.assessments.id, assessment.id));

    return {
      assessment: finalAssessment,
      ai: {
        provider: aiResult.metadata.provider,
        model: aiResult.metadata.model,
        isEmergency: aiResult.isEmergency,
        confidenceScore: aiResult.confidenceScore,
      },
      mappedRequirements,
      unmappedRequirements,
      careBundle,
      careRequirements: createdRequirements,
      requirements: createdRequirements, // Backward & Frontend compatibility
    };
  }
}
