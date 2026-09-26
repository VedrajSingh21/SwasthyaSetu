import { Controller, Get, Post, Param, ParseUUIDPipe, Optional } from '@nestjs/common';
import { BottlenecksService } from './bottlenecks.service.js';

@Controller('bottlenecks')
export class BottlenecksController {
  constructor(private readonly bottlenecksService: BottlenecksService) {}

  @Get('summary')
  async getSummary() {
    return this.bottlenecksService.getDistrictBottlenecks();
  }

  @Get('district/:districtId')
  async getDistrictBottlenecks(@Param('districtId', ParseUUIDPipe) districtId: string) {
    return this.bottlenecksService.getDistrictBottlenecks(districtId);
  }

  @Post('resolve/:facilityId/:serviceId')
  async resolve(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.bottlenecksService.resolveBottleneck(facilityId, serviceId);
  }
}
