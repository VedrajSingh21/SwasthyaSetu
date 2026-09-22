import { Controller, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { JourneysService } from './journeys.service.js';

@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly journeysService: JourneysService) {}

  @Patch(':id/status')
  async completeFollowUp(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    if (body.status !== 'COMPLETED') {
      throw new BadRequestException('Only COMPLETED status update is supported');
    }
    
    return this.journeysService.completeFollowUp(id);
  }
}
