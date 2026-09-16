import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { DynamicRoutingService } from './dynamic-routing.service.js';

@Controller('dynamic-routing')
export class DynamicRoutingController {
  constructor(private readonly dynamicRoutingService: DynamicRoutingService) {}

  @Get('bundle/:bundleId/candidates')
  async getCandidates(
    @Param('bundleId', ParseUUIDPipe) bundleId: string,
  ) {
    return this.dynamicRoutingService.getRoutingCandidates(bundleId);
  }

  @Get('bundle/:bundleId/recommendation')
  async getRecommendation(
    @Param('bundleId', ParseUUIDPipe) bundleId: string,
  ) {
    return this.dynamicRoutingService.getRoutingRecommendation(bundleId);
  }

  @Get('bundle/:bundleId/reroute/:currentFacilityId')
  async getReroute(
    @Param('bundleId', ParseUUIDPipe) bundleId: string,
    @Param('currentFacilityId', ParseUUIDPipe) currentFacilityId: string,
  ) {
    return this.dynamicRoutingService.getReroutingRecommendation(bundleId, currentFacilityId);
  }

  @Post('referrals/:referralId/recover')
  async recoverReferral(
    @Param('referralId', ParseUUIDPipe) referralId: string,
  ) {
    return this.dynamicRoutingService.recoverReferral(referralId);
  }
}
