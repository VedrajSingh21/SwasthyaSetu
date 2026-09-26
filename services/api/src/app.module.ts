import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { FacilitiesModule } from './modules/facilities/facilities.module.js';
import { PatientsModule } from './modules/patients/patients.module.js';
import { CareReadinessModule } from './modules/care-readiness/care-readiness.module.js';
import { DynamicRoutingModule } from './modules/dynamic-routing/dynamic-routing.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { AssessmentsModule } from './modules/assessments/assessments.module.js';
import { InteroperabilityModule } from './modules/interoperability/interoperability.module.js';
import { ReferralsModule } from './modules/referrals/referrals.module.js';
import { JourneysModule } from './modules/journeys/journeys.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { VoiceModule } from './modules/voice/voice.module.js';
import { OcrModule } from './modules/ocr/ocr.module.js';
import { BottlenecksModule } from './modules/bottlenecks/bottlenecks.module.js';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    NotificationsModule,
    VoiceModule,
    OcrModule,
    BottlenecksModule,
    FacilitiesModule,
    PatientsModule,
    CareReadinessModule,
    DynamicRoutingModule,
    AiModule,
    AssessmentsModule,
    InteroperabilityModule,
    ReferralsModule,
    JourneysModule,
  ],
})
export class AppModule {}
