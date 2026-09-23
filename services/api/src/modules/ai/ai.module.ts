import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { AgentService } from './agent.service.js';
import { AgentController } from './agent.controller.js';
import { PatientsModule } from '../patients/patients.module.js';

@Module({
  imports: [PatientsModule],
  controllers: [AiController, AgentController],
  providers: [AiService, AgentService],
  exports: [AiService, AgentService],
})
export class AiModule {}
