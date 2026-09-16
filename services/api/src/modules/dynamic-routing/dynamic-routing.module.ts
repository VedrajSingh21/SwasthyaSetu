import { Module } from '@nestjs/common';
import { DynamicRoutingController } from './dynamic-routing.controller.js';
import { DynamicRoutingService } from './dynamic-routing.service.js';
import { CareReadinessModule } from '../care-readiness/care-readiness.module.js';

import { DatabaseModule } from '../../database/database.module.js';

@Module({
  imports: [CareReadinessModule, DatabaseModule],
  controllers: [DynamicRoutingController],
  providers: [DynamicRoutingService],
})
export class DynamicRoutingModule {}
