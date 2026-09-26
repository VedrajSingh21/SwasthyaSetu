import { Injectable, Logger } from '@nestjs/common';

export type SmsTemplate = 
  | 'REFERRAL_CREATED' 
  | 'REFERRAL_REROUTED' 
  | 'APPOINTMENT_SCHEDULED' 
  | 'FOLLOW_UP_REMINDER';

export interface SendSmsPayload {
  toPhone: string;
  template: SmsTemplate;
  params: Record<string, string>;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string | undefined;
  private readonly senderId: string;

  constructor() {
    this.apiKey = process.env.FAST2SMS_API_KEY || process.env.MSG91_AUTH_KEY;
    this.senderId = process.env.DLT_SENDER_ID || 'SWASTH';
  }

  // Approved DLT Message Templates (Hindi / Hinglish / English)
  private formatMessage(template: SmsTemplate, params: Record<string, string>): string {
    switch (template) {
      case 'REFERRAL_CREATED':
        return `[SwasthyaSetu] Namaste ${params.patientName || 'Patient'}, aapka referral ${params.facilityName || 'Hospital'} ke liye create ho gaya hai. Token #${params.token || '101'}. Kripya samay par pahunchein.`;
      case 'REFERRAL_REROUTED':
        return `[SwasthyaSetu URGENT] ${params.facilityName || 'Hospital'} mein suvidha upalabdh na hone ke karan aapka referral ${params.newFacilityName || 'Alternative Center'} mein shift kiya gaya hai. Distance: ${params.distance || '12'} km.`;
      case 'APPOINTMENT_SCHEDULED':
        return `[SwasthyaSetu] Aapka appointment ${params.facilityName} mein ${params.date} ko ${params.time || '10:00 AM'} baje scheduled hai. Doctor: ${params.doctor || 'On Duty'}.`;
      case 'FOLLOW_UP_REMINDER':
        return `[SwasthyaSetu] Reminder: Aapka follow-up checkup ${params.facilityName} mein scheduled hai. Kripya apne purane parchi aur reports saath layein.`;
      default:
        return `[SwasthyaSetu] Update regarding your healthcare referral. Please contact your ASHA worker.`;
    }
  }

  async sendSms(payload: SendSmsPayload): Promise<{ success: boolean; messageId?: string; simulated: boolean }> {
    const cleanPhone = payload.toPhone.replace(/\D/g, '').slice(-10);
    const text = this.formatMessage(payload.template, payload.params);

    if (this.apiKey) {
      try {
        // Fast2SMS integration
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'dlt',
            sender_id: this.senderId,
            message: text,
            flash: 0,
            numbers: cleanPhone,
          }),
        });

        const data = await response.json();
        this.logger.log(`DLT SMS dispatched to +91-${cleanPhone}: ${data.message || 'Success'}`);
        return { success: true, messageId: data.request_id, simulated: false };
      } catch (err: any) {
        this.logger.error(`Failed to send DLT SMS to +91-${cleanPhone}: ${err.message}`);
      }
    }

    // Deterministic simulation & local audit log
    this.logger.log(`[SIMULATED DLT SMS] To: +91-${cleanPhone} | Template: ${payload.template}`);
    this.logger.log(`[MESSAGE CONTENT]: "${text}"`);

    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      simulated: true,
    };
  }
}
