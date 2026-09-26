import { Module, Global } from '@nestjs/common';
import { BhashiniService } from './bhashini.service.js';
import { VoiceController } from './voice.controller.js';

@Global()
@Module({
  controllers: [VoiceController],
  providers: [BhashiniService],
  exports: [BhashiniService],
})
export class VoiceModule {}
