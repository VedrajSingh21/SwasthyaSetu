import { Controller, Post, Body } from '@nestjs/common';
import { SmsService, SmsTemplate } from './sms.service.js';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class SendNotificationDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  template: SmsTemplate;

  @IsNotEmpty()
  @IsObject()
  params: Record<string, string>;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('sms')
  async sendSmsNotification(@Body() body: SendNotificationDto) {
    return this.smsService.sendSms({
      toPhone: body.phone,
      template: body.template,
      params: body.params,
    });
  }
}
