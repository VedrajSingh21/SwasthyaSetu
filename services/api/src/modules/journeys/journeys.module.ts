import { Module } from '@nestjs/common';
import { JourneysService } from './journeys.service.js';
import { JourneysController } from './journeys.controller.js';
import { CareRequirementsController } from './care-requirements.controller.js';
import { FollowUpsController } from './follow-ups.controller.js';
import { InterventionsService } from './interventions.service.js';
import { InterventionsController } from './interventions.controller.js';

@Module({
  controllers: [JourneysController, CareRequirementsController, FollowUpsController, InterventionsController],
  providers: [JourneysService, InterventionsService],
  exports: [JourneysService, InterventionsService],
})
export class JourneysModule {}
