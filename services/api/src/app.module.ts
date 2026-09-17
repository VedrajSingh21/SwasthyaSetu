import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { FacilitiesModule } from './modules/facilities/facilities.module.js';
import { PatientsModule } from './modules/patients/patients.module.js';
import { CareReadinessModule } from './modules/care-readiness/care-readiness.module.js';
import { DynamicRoutingModule } from './modules/dynamic-routing/dynamic-routing.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { AssessmentsModule } from './modules/assessments/assessments.module.js';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    FacilitiesModule,
    PatientsModule,
    CareReadinessModule,
    DynamicRoutingModule,
    AiModule,
    AssessmentsModule,
  ],
})
export class AppModule {}
