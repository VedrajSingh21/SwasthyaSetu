import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { eq, inArray, and } from 'drizzle-orm';
import { facilities, facilityServices, facilityCapacity } from '../../database/schema/facilities.js';
import { careBundles, careRequirements } from '../../database/schema/care.js';

export interface FacilityReadinessInput {
  facilityId: string;
  facility: any;
  bundleId: string;
  bundle: any;
  requirements: any[];
  availableServices: string[];
  unavailableServices: string[];
  capacityInformation: any[];
}

export interface RequirementReadiness {
  serviceId: string;
  serviceName: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'CAPACITY_FULL' | 'NO_CAPACITY_DATA';
  capacity?: {
    capacity: number;
    currentLoad: number;
    remaining: number;
  };
}

export interface BlockingReason {
  code: 'SERVICE_UNAVAILABLE' | 'CAPACITY_FULL' | 'NO_CAPACITY_DATA';
  serviceId: string;
  serviceName: string;
  message: string;
}

export interface FacilityReadinessResponse {
  facilityId: string;
  facilityName: string;
  bundleId: string;
  bundleName: string;
  status: 'CARE_READY' | 'NOT_CARE_READY';
  readinessScore: number;
  requirements: RequirementReadiness[];
  blockingReasons: BlockingReason[];
}

export interface MultiFacilityReadinessResponse {
  bundle: {
    id: string;
    name: string;
  };
  facilities: Omit<FacilityReadinessResponse, 'bundleId' | 'bundleName'>[];
}

@Injectable()
export class CareReadinessService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async getReadinessInput(facilityId: string, bundleId: string): Promise<FacilityReadinessInput> {
    const facilityResult = await this.db.select().from(facilities).where(eq(facilities.id, facilityId));
    if (!facilityResult || facilityResult.length === 0) {
      throw new NotFoundException(`Facility with ID ${facilityId} not found`);
    }
    const facility = facilityResult[0];

    const bundleResult = await this.db.select().from(careBundles).where(eq(careBundles.id, bundleId));
    if (!bundleResult || bundleResult.length === 0) {
      throw new NotFoundException(`Care Bundle with ID ${bundleId} not found`);
    }
    const bundle = bundleResult[0];

    const requirements = await this.db.select().from(careRequirements).where(eq(careRequirements.careBundleId, bundleId));
    const requiredServices = requirements.map((req: any) => req.serviceId);

    let availableServices: string[] = [];
    let unavailableServices: string[] = [];
    let capacityInformation: any[] = [];

    if (requiredServices.length > 0) {
      const facServices = await this.db.select().from(facilityServices).where(
        and(
          eq(facilityServices.facilityId, facilityId),
          inArray(facilityServices.serviceId, requiredServices)
        )
      );

      const facCapacity = await this.db.select().from(facilityCapacity).where(
        and(
          eq(facilityCapacity.facilityId, facilityId),
          inArray(facilityCapacity.serviceId, requiredServices)
        )
      );

      capacityInformation = facCapacity;

      for (const reqServiceId of requiredServices) {
        const hasService = facServices.find((fs: any) => fs.serviceId === reqServiceId && fs.availabilityStatus === true);
        if (hasService) {
          availableServices.push(reqServiceId);
        } else {
          unavailableServices.push(reqServiceId);
        }
      }
    }

    return {
      facilityId,
      facility,
      bundleId,
      bundle,
      requirements,
      availableServices,
      unavailableServices,
      capacityInformation,
    };
  }

  evaluateReadiness(input: FacilityReadinessInput): FacilityReadinessResponse {
    const reqResults: RequirementReadiness[] = [];
    const blockingReasons: BlockingReason[] = [];
    let fulfillableCount = 0;

    for (const req of input.requirements) {
      const serviceId = req.serviceId;
      const serviceName = req.name;

      if (input.unavailableServices.includes(serviceId)) {
        reqResults.push({
          serviceId,
          serviceName,
          status: 'UNAVAILABLE',
        });
        blockingReasons.push({
          code: 'SERVICE_UNAVAILABLE',
          serviceId,
          serviceName,
          message: `${serviceName} is not currently available at this facility`,
        });
        continue;
      }

      const capInfo = input.capacityInformation.find((c: any) => c.serviceId === serviceId);
      if (!capInfo) {
        reqResults.push({
          serviceId,
          serviceName,
          status: 'NO_CAPACITY_DATA',
        });
        blockingReasons.push({
          code: 'NO_CAPACITY_DATA',
          serviceId,
          serviceName,
          message: `Capacity data for ${serviceName} is missing`,
        });
        continue;
      }

      const remaining = capInfo.capacity - capInfo.currentLoad;
      if (remaining <= 0) {
        reqResults.push({
          serviceId,
          serviceName,
          status: 'CAPACITY_FULL',
          capacity: {
            capacity: capInfo.capacity,
            currentLoad: capInfo.currentLoad,
            remaining,
          }
        });
        blockingReasons.push({
          code: 'CAPACITY_FULL',
          serviceId,
          serviceName,
          message: `${serviceName} is at full capacity`,
        });
        continue;
      }

      // AVAILABLE
      fulfillableCount++;
      reqResults.push({
        serviceId,
        serviceName,
        status: 'AVAILABLE',
        capacity: {
          capacity: capInfo.capacity,
          currentLoad: capInfo.currentLoad,
          remaining,
        }
      });
    }

    const total = input.requirements.length;
    let readinessScore = 0;
    let status: 'CARE_READY' | 'NOT_CARE_READY' = 'NOT_CARE_READY';

    if (total > 0) {
      readinessScore = Math.round((fulfillableCount / total) * 100);
      if (fulfillableCount === total) {
        status = 'CARE_READY';
      }
    } else {
      blockingReasons.push({
        code: 'SERVICE_UNAVAILABLE',
        serviceId: 'none',
        serviceName: 'No Requirements Specified',
        message: 'Care bundle does not have any active clinical requirements.',
      });
    }

    return {
      facilityId: input.facilityId,
      facilityName: input.facility.name,
      bundleId: input.bundleId,
      bundleName: input.bundle.title,
      status,
      readinessScore,
      requirements: reqResults,
      blockingReasons,
    };
  }

  async getFacilityReadiness(facilityId: string, bundleId: string): Promise<FacilityReadinessResponse> {
    const input = await this.getReadinessInput(facilityId, bundleId);
    return this.evaluateReadiness(input);
  }

  async getAllFacilitiesReadiness(bundleId: string): Promise<MultiFacilityReadinessResponse> {
    const bundleResult = await this.db.select().from(careBundles).where(eq(careBundles.id, bundleId));
    if (!bundleResult || bundleResult.length === 0) {
      throw new NotFoundException(`Care Bundle with ID ${bundleId} not found`);
    }
    const bundle = bundleResult[0];

    const allFacilities = await this.db.select().from(facilities).where(eq(facilities.active, true));
    
    if (allFacilities.length === 0) {
      return {
        bundle: {
          id: bundle.id,
          name: bundle.title,
        },
        facilities: [],
      };
    }

    // Pre-fetch requirements ONCE
    const requirements = await this.db.select().from(careRequirements).where(eq(careRequirements.careBundleId, bundleId));
    const requiredServices = requirements.map((req: any) => req.serviceId);
    const facilityIds = allFacilities.map((f: any) => f.id);

    // Batch pre-fetch all facility services & capacity in 2 queries total (Eliminates N+1 query storm)
    let allFacServices: any[] = [];
    let allFacCapacity: any[] = [];

    if (requiredServices.length > 0 && facilityIds.length > 0) {
      allFacServices = await this.db.select().from(facilityServices).where(
        and(
          inArray(facilityServices.facilityId, facilityIds),
          inArray(facilityServices.serviceId, requiredServices)
        )
      );

      allFacCapacity = await this.db.select().from(facilityCapacity).where(
        and(
          inArray(facilityCapacity.facilityId, facilityIds),
          inArray(facilityCapacity.serviceId, requiredServices)
        )
      );
    }

    const facilityResults = [];
    for (const facility of allFacilities) {
      let availableServices: string[] = [];
      let unavailableServices: string[] = [];

      const facServices = allFacServices.filter((fs: any) => fs.facilityId === facility.id);
      const facCapacity = allFacCapacity.filter((fc: any) => fc.facilityId === facility.id);

      for (const reqServiceId of requiredServices) {
        const hasService = facServices.find((fs: any) => fs.serviceId === reqServiceId && fs.availabilityStatus === true);
        if (hasService) {
          availableServices.push(reqServiceId);
        } else {
          unavailableServices.push(reqServiceId);
        }
      }

      const input: FacilityReadinessInput = {
        facilityId: facility.id,
        facility,
        bundleId,
        bundle,
        requirements,
        availableServices,
        unavailableServices,
        capacityInformation: facCapacity,
      };

      const readiness = this.evaluateReadiness(input);
      facilityResults.push(readiness);
    }

    // Rank facilities
    facilityResults.sort((a, b) => {
      // 1. CARE_READY before NOT_CARE_READY
      if (a.status === 'CARE_READY' && b.status === 'NOT_CARE_READY') return -1;
      if (a.status === 'NOT_CARE_READY' && b.status === 'CARE_READY') return 1;

      // 2. Higher readinessScore first
      if (a.readinessScore !== b.readinessScore) {
        return b.readinessScore - a.readinessScore;
      }

      // 3. If readinessScore is equal, prefer the facility with fewer blocking reasons
      if (a.blockingReasons.length !== b.blockingReasons.length) {
        return a.blockingReasons.length - b.blockingReasons.length;
      }

      // 4. If still equal, sort by facility name alphabetically
      return a.facilityName.localeCompare(b.facilityName);
    });

    const mappedFacilities = facilityResults.map(r => {
      const { bundleId, bundleName, ...rest } = r;
      return rest;
    });

    return {
      bundle: {
        id: bundle.id,
        name: bundle.title,
      },
      facilities: mappedFacilities as any,
    };
  }
}
