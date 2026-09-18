import { Controller, Post, Body, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { ReferralsService } from './referrals.service.js';
import { CreateReferralDto } from './dto/create-referral.dto.js';
import { UpdateReferralStatusDto } from './dto/update-referral-status.dto.js';
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  async create(@Body() createReferralDto: CreateReferralDto) {
    return this.referralsService.create(createReferralDto);
  }
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReferralStatusDto: UpdateReferralStatusDto
  ) {
    return this.referralsService.updateStatus(id, updateReferralStatusDto);
  }
}
