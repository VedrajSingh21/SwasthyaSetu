import { Controller, Get, Param } from '@nestjs/common';
import { CareReadinessService } from './care-readiness.service.js';

@Controller('care-readiness')
export class CareReadinessController {
  constructor(private readonly careReadinessService: CareReadinessService) {}

  @Get('facility/:facilityId/bundle/:bundleId')
  async getReadinessInput(
    @Param('facilityId') facilityId: string,
    @Param('bundleId') bundleId: string,
  ) {
    return this.careReadinessService.getReadinessInput(facilityId, bundleId);
  }
}
