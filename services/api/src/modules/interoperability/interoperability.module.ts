import { Module } from '@nestjs/common';
import { InteroperabilityController } from './interoperability.controller.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [InteroperabilityController],
  providers: [],
})
export class InteroperabilityModule {}
