import { Controller, Post, Body } from '@nestjs/common';
import { AssessmentsService } from './assessments.service.js';
import type { ProcessAssessmentInput } from './assessments.service.js';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post('process')
  async processAssessment(@Body() body: any) {
    return this.assessmentsService.processAssessment(body as ProcessAssessmentInput);
  }
}

