import { Controller, Get, Param } from '@nestjs/common';
import { FacilitiesService } from './facilities.service.js';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  async findAll() {
    return this.facilitiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }
}
