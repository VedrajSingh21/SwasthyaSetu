import { Controller, Get, Post, Body, Param, ParseUUIDPipe, NotFoundException, Inject } from '@nestjs/common';
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

  @Get('practitioners/:id')
  async getPractitioner(@Param('id', ParseUUIDPipe) id: string) {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    if (!user) {
      throw new NotFoundException('Practitioner not found');
    }
    
    // Explicitly reject PATIENT role as they are not practitioners
    if (user.role === 'PATIENT') {
      throw new NotFoundException('Practitioner not found');
    }

    return InteroperabilityMapper.mapToPractitionerResource(user);
  }

  // --- Beckn Protocol (ABDM UHI / Open Health Network) ---

  @Post('beckn/search')
  async becknSearch(@Body() body: any) {
    const facilitiesList = await this.db.select().from(schema.facilities).where(eq(schema.facilities.active, true));
    
    return {
      context: {
        domain: 'nic2004:85110', // Healthcare services
        country: 'IND',
        city: 'std:020',
        action: 'on_search',
        core_version: '0.9.3',
        bap_id: body?.context?.bap_id || 'swasthyasetu.abdm.network',
        bpp_id: 'swasthyasetu.provider.network',
        transaction_id: body?.context?.transaction_id || `txn_${Date.now()}`,
        message_id: `msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      message: {
        catalog: {
          'bpp/descriptor': {
            name: 'SwasthyaSetu Rural Care Network',
          },
          'bpp/providers': facilitiesList.map(f => ({
            id: f.id,
            descriptor: { name: f.name },
            locations: [{ id: `loc_${f.id}`, gps: `${f.latitude || 18.5204},${f.longitude || 73.8567}` }],
            categories: [{ id: f.type, descriptor: { name: f.type } }],
          })),
        },
      },
    };
  }

  @Post('beckn/init')
  async becknInit(@Body() body: any) {
    const order = body?.message?.order || {};
    return {
      context: {
        ...body.context,
        action: 'on_init',
        timestamp: new Date().toISOString(),
      },
      message: {
        order: {
          id: `order_${Date.now()}`,
          state: 'INITIALIZED',
          provider: order.provider,
          items: order.items || [{ id: 'care-bundle-referral', descriptor: { name: 'Care Continuity Referral' } }],
          quote: { price: { currency: 'INR', value: '0' } }, // Free public healthcare
        },
      },
    };
  }

  @Post('beckn/confirm')
  async becknConfirm(@Body() body: any) {
    const order = body?.message?.order || {};
    return {
      context: {
        ...body.context,
        action: 'on_confirm',
        timestamp: new Date().toISOString(),
      },
      message: {
        order: {
          ...order,
          id: order.id || `order_${Date.now()}`,
          state: 'CONFIRMED',
          status: 'ACCEPTED',
          fulfillment: {
            tracking: true,
            status: 'CARE_READY',
          },
        },
      },
    };
  }
}
