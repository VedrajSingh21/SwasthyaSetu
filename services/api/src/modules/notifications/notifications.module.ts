import { Module, Global } from '@nestjs/common';
import { SmsService } from './sms.service.js';
import { NotificationsController } from './notifications.controller.js';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class NotificationsModule {}
