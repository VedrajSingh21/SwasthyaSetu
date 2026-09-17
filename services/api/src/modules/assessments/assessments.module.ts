import { Module } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller.js';
import { AssessmentsService } from './assessments.service.js';
import { AiModule } from '../ai/ai.module.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({
  imports: [AiModule, DatabaseModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
