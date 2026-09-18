import { Controller, Post, Body } from '@nestjs/common';
import { ReferralsService } from './referrals.service.js';
import { CreateReferralDto } from './dto/create-referral.dto.js';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  async create(@Body() createReferralDto: CreateReferralDto) {
    return this.referralsService.create(createReferralDto);
  }
}
