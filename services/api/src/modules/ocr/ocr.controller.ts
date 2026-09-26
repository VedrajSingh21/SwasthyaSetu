import { Controller, Post, Body } from '@nestjs/common';
import { OcrService } from './ocr.service.js';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ProcessSlipDto {
  @IsNotEmpty()
  @IsString()
  extractedText: string;

  @IsOptional()
  @IsString()
  source?: 'TESSERACT_WASM' | 'MOBILE_CAMERA' | 'MANUAL_UPLOAD';
}

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('process-slip')
  async processSlip(@Body() body: ProcessSlipDto) {
    return this.ocrService.processMedicalSlip({
      extractedText: body.extractedText,
      source: body.source,
    });
  }
}
