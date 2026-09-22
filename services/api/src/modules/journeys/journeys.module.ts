import { Module } from '@nestjs/common';
import { JourneysService } from './journeys.service.js';
import { JourneysController } from './journeys.controller.js';
import { CareRequirementsController } from './care-requirements.controller.js';

@Module({
  controllers: [JourneysController, CareRequirementsController],
  providers: [JourneysService],
  exports: [JourneysService],
})
export class JourneysModule {}
