import { Controller, Post, Body } from '@nestjs/common';
import { BhashiniService } from './bhashini.service.js';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class VoiceProcessDto {
  @IsNotEmpty()
  @IsString()
  transcript: string;

  @IsOptional()
  @IsString()
  sourceLanguage?: string;
}

@Controller('voice')
export class VoiceController {
  constructor(private readonly bhashiniService: BhashiniService) {}

  @Post('process-speech')
  async processSpeech(@Body() body: VoiceProcessDto) {
    return this.bhashiniService.processVoiceTranscript({
      transcript: body.transcript,
      sourceLanguage: body.sourceLanguage,
    });
  }
}
