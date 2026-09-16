import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CareReadinessService } from './care-readiness.service.js';

@Controller('care-readiness')
export class CareReadinessController {
  constructor(private readonly careReadinessService: CareReadinessService) {}

  @Get('facility/:facilityId/bundle/:bundleId')
  async getReadiness(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @Param('bundleId', ParseUUIDPipe) bundleId: string,
  ) {
    return this.careReadinessService.getFacilityReadiness(facilityId, bundleId);
  }

  @Get('bundle/:bundleId/facilities')
  async getAllFacilitiesReadiness(
    @Param('bundleId', ParseUUIDPipe) bundleId: string,
  ) {
    return this.careReadinessService.getAllFacilitiesReadiness(bundleId);
  }
}
