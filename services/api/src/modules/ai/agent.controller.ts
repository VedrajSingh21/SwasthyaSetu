import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AgentService } from './agent.service.js';
import { AgentContext } from './agent.types.js';

class ChatRequestDto {
  patientId: string;
  message: string;
  language?: string;
  currentPage?: string;
  currentJourneyId?: string;
}

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequestDto) {
    if (!body.patientId || !body.message) {
      throw new BadRequestException('patientId and message are required');
    }

    // TODO: SECURITY NOTE
    // The patientId is currently read from the request body as trusted prototype context.
    // In a production environment, this must come from an authenticated user identity (e.g., JWT token or session)
    // rather than relying on the client's payload.
    // Do NOT deploy to production without extracting identity from the request context.
    const context: AgentContext = {
      patientId: body.patientId,
      language: body.language,
      currentPage: body.currentPage,
      currentJourneyId: body.currentJourneyId,
    };

    return this.agentService.chat(context, body.message);
  }
}
