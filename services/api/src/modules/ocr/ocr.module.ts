import { Module, Global } from '@nestjs/common';
import { OcrService } from './ocr.service.js';
import { OcrController } from './ocr.controller.js';

@Global()
@Module({
  controllers: [OcrController],
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}
