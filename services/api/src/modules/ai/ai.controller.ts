import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service.js';
import type { AiAssessmentInput } from './providers/provider.interface.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract-care-requirements')
  async extractCareRequirements(@Body() body: any) {
    return this.aiService.extractCareRequirements(body as AiAssessmentInput);
  }
}
