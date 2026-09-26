import { Module } from '@nestjs/common';
import { BottlenecksService } from './bottlenecks.service.js';
import { BottlenecksController } from './bottlenecks.controller.js';

@Module({
  controllers: [BottlenecksController],
  providers: [BottlenecksService],
  exports: [BottlenecksService],
})
export class BottlenecksModule {}
