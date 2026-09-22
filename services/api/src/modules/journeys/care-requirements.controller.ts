import { Controller, Patch, Param } from '@nestjs/common';
import { JourneysService } from './journeys.service.js';

@Controller('care-requirements')
export class CareRequirementsController {
  constructor(private readonly journeysService: JourneysService) {}

  @Patch(':id/status')
  async completeRequirement(@Param('id') id: string) {
    // Only handles 'COMPLETED' for this phase.
    return this.journeysService.markRequirementCompleted(id);
  }
}
