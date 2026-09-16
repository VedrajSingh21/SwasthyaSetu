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
  requiredServices: string[];
  availableServices: string[];
  unavailableServices: string[];
  capacityInformation: any[];
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
      requiredServices,
      availableServices,
      unavailableServices,
      capacityInformation,
    };
  }
}
