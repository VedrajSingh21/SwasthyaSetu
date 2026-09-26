import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../database/schema/index.js';
import { eq, and } from 'drizzle-orm';

export interface DistrictBottleneckReport {
  districtId?: string;
  districtName: string;
  totalFacilities: number;
  readyFacilities: number;
  blockedReferralsCount: number;
  activeBottlenecks: Array<{
    id: string;
    facilityId: string;
    facilityName: string;
    serviceName: string;
    issue: string;
    impact: 'High' | 'Medium' | 'Low';
    affectedReferrals: number;
    recommendedAction: string;
  }>;
  summary: {
    networkStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
    primaryBottleneckService?: string;
  };
}

@Injectable()
export class BottlenecksService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: PostgresJsDatabase<typeof schema>) {}

  async getDistrictBottlenecks(districtId?: string): Promise<DistrictBottleneckReport> {
    // 1. Fetch facilities
    let districtName = 'Pune District';
    if (districtId) {
      const [dist] = await this.db.select().from(schema.districts).where(eq(schema.districts.id, districtId));
      if (dist) districtName = dist.name;
    }

    const allFacilities = districtId
      ? await this.db.select().from(schema.facilities).where(eq(schema.facilities.districtId, districtId))
      : await this.db.select().from(schema.facilities);

    // 2. Fetch blocked referrals
    const blockedReferrals = await this.db.select().from(schema.referrals).where(eq(schema.referrals.status, 'BLOCKED'));

    // 3. Fetch unavailable services
    const unavailableServices = await this.db.select({
      facilityService: schema.facilityServices,
      facility: schema.facilities,
      service: schema.services,
    })
    .from(schema.facilityServices)
    .innerJoin(schema.facilities, eq(schema.facilityServices.facilityId, schema.facilities.id))
    .innerJoin(schema.services, eq(schema.facilityServices.serviceId, schema.services.id))
    .where(eq(schema.facilityServices.availabilityStatus, false));

    // 4. Map active bottlenecks
    const activeBottlenecks = unavailableServices.map((row, idx) => {
      const facilityBlockedCount = blockedReferrals.filter(r => r.destinationFacilityId === row.facility.id).length;
      return {
        id: `bn_${row.facility.id}_${row.service.id}`,
        facilityId: row.facility.id,
        facilityName: row.facility.name,
        serviceName: row.service.name,
        issue: `${row.service.name} unavailable (Equipment failure / Staff vacancy)`,
        impact: facilityBlockedCount > 2 ? 'High' as const : 'Medium' as const,
        affectedReferrals: facilityBlockedCount || 1,
        recommendedAction: `Deploy mobile unit or reroute incoming ${row.service.name} referrals to nearest equipped CHC/DH.`,
      };
    });

    const totalFacilities = allFacilities.length || 4;
    const facilitiesWithIssues = new Set(unavailableServices.map(u => u.facility.id));
    const readyFacilities = Math.max(0, totalFacilities - facilitiesWithIssues.size);

    const networkStatus = blockedReferrals.length > 5 ? 'CRITICAL' : activeBottlenecks.length > 0 ? 'DEGRADED' : 'OPTIMAL';

    return {
      districtId,
      districtName,
      totalFacilities,
      readyFacilities,
      blockedReferralsCount: blockedReferrals.length,
      activeBottlenecks,
      summary: {
        networkStatus,
        primaryBottleneckService: activeBottlenecks[0]?.serviceName,
      },
    };
  }

  async resolveBottleneck(facilityId: string, serviceId: string) {
    // Restore service availability
    const [updated] = await this.db.update(schema.facilityServices)
      .set({ availabilityStatus: true })
      .where(
        and(
          eq(schema.facilityServices.facilityId, facilityId),
          eq(schema.facilityServices.serviceId, serviceId)
        )
      )
      .returning();

    return {
      success: true,
      message: 'Facility service restored to CARE_READY status',
      facilityService: updated,
    };
  }
}
