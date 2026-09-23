import { Controller, Get } from '@nestjs/common';
import { InterventionsService, StuckJourneyIntervention } from './interventions.service.js';

@Controller('interventions')
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  @Get('stuck-journeys')
  async getStuckJourneys(): Promise<StuckJourneyIntervention[]> {
    return this.interventionsService.getStuckJourneys();
  }
}
