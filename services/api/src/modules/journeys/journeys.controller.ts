import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { JourneysService } from './journeys.service.js';

@Controller('journeys')
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @Get(':id')
  async getJourney(@Param('id') id: string) {
    return this.journeysService.getJourney(id);
  }

  @Post(':id/advance')
  async advanceJourney(
    @Param('id') id: string,
    @Body() body: { requestedStage: string; actorId?: string; notes?: string; completedRequirementId?: string }
  ) {
    const updated = await this.journeysService.advanceJourney(id, body.requestedStage, body.actorId, body.notes);
    
    if (body.completedRequirementId) {
      await this.journeysService.markRequirementCompleted(body.completedRequirementId);
    }
    
    return this.journeysService.getJourney(id);
  }
}
