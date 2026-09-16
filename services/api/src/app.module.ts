import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { FacilitiesModule } from './modules/facilities/facilities.module.js';
import { PatientsModule } from './modules/patients/patients.module.js';
import { CareReadinessModule } from './modules/care-readiness/care-readiness.module.js';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    FacilitiesModule,
    PatientsModule,
    CareReadinessModule,
  ],
})
export class AppModule {}
