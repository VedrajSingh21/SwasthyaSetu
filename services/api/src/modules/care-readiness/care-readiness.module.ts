import { Module } from '@nestjs/common';
import { CareReadinessController } from './care-readiness.controller.js';
import { CareReadinessService } from './care-readiness.service.js';

@Module({
  controllers: [CareReadinessController],
  providers: [CareReadinessService],
  exports: [CareReadinessService],
})
export class CareReadinessModule {}
