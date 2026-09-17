import { Controller, Get, Param, ParseUUIDPipe, NotFoundException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../database/schema/index.js';
import { eq } from 'drizzle-orm';
import { InteroperabilityMapper } from './interoperability.mapper.js';

@Controller('interoperability')
export class InteroperabilityController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  @Get('patients/:id')
  async getPatient(@Param('id', ParseUUIDPipe) id: string) {
    const [patient] = await this.db.select().from(schema.patients).where(eq(schema.patients.id, id));
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return InteroperabilityMapper.mapToPatientResource(patient);
  }

  @Get('care-bundles/:id')
  async getCareBundle(@Param('id', ParseUUIDPipe) id: string) {
    const [careBundle] = await this.db.select().from(schema.careBundles).where(eq(schema.careBundles.id, id));
    if (!careBundle) {
      throw new NotFoundException('CareBundle not found');
    }
    const requirements = await this.db.select().from(schema.careRequirements).where(eq(schema.careRequirements.careBundleId, id));
    
    return InteroperabilityMapper.mapToCarePlanResource(careBundle, requirements);
  }

  @Get('referrals/:id')
  async getReferral(@Param('id', ParseUUIDPipe) id: string) {
    const [referral] = await this.db.select().from(schema.referrals).where(eq(schema.referrals.id, id));
    if (!referral) {
      throw new NotFoundException('Referral not found');
    }
    return InteroperabilityMapper.mapToServiceRequestResource(referral);
  }

  @Get('facilities/:id')
  async getFacility(@Param('id', ParseUUIDPipe) id: string) {
    const [facility] = await this.db.select().from(schema.facilities).where(eq(schema.facilities.id, id));
    if (!facility) {
      throw new NotFoundException('Facility not found');
    }
    return InteroperabilityMapper.mapToOrganizationResource(facility);
  }
}
