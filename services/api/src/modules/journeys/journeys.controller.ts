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
    @Body() body: { requestedStage: string; actorId?: string; notes?: string }
  ) {
    return this.journeysService.advanceJourney(id, body.requestedStage, body.actorId, body.notes);
  }
}
