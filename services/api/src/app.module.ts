import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { FacilitiesModule } from './modules/facilities/facilities.module.js';
import { PatientsModule } from './modules/patients/patients.module.js';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    FacilitiesModule,
    PatientsModule,
  ],
})
export class AppModule {}
