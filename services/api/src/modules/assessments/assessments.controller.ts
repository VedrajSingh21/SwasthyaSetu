import { Controller, Post, Body } from '@nestjs/common';
import { AssessmentsService } from './assessments.service.js';
import { ProcessAssessmentDto } from './dto/process-assessment.dto.js';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post('process')
  async processAssessment(@Body() body: ProcessAssessmentDto) {
    return this.assessmentsService.processAssessment(body);
  }
}

