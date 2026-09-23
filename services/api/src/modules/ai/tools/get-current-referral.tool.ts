import { AgentTool, AgentContext } from '../agent.types.js';
import { PatientsService } from '../../patients/patients.service.js';
import { FacilitiesService } from '../../facilities/facilities.service.js';

export interface GetCurrentReferralInput {
  patientId: string;
}

export function createGetCurrentReferralTool(
  patientsService: PatientsService,
  facilitiesService: FacilitiesService,
): AgentTool<GetCurrentReferralInput> {
  return {
    name: 'getCurrentReferral',
    description: 'Retrieves the current active referral for the patient. Use this to answer questions about which hospital or facility the patient has been referred to, and the status of the referral.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'The ID of the patient. Must match the current user context.',
        },
      },
      required: ['patientId'],
    },
    readOnly: true,
    execute: async (context: AgentContext, input: GetCurrentReferralInput) => {
      // 1. Enforce Patient Isolation
      if (context.patientId !== input.patientId) {
        return { error: 'Unauthorized: Cannot access referral for another patient.' };
      }

      try {
        // 2. Fetch referrals using the existing business logic
        const referrals = await patientsService.findReferrals(input.patientId);

        // 3. Selection rule: Find the active referral. 
        // The repository's domain logic considers a referral active if it is not COMPLETED or CANCELLED.
        const activeReferrals = referrals.filter(
          (r: any) => !['COMPLETED', 'CANCELLED'].includes(r.status)
        );

        // If there are multiple active referrals, the newest one is generally the most relevant current referral.
        const activeReferral = activeReferrals.sort(
          (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()
        )[0];

        if (!activeReferral) {
          return { hasReferral: false, message: 'The patient does not currently have an active referral.' };
        }

        // 4. Double check security
        if (activeReferral.patientId !== context.patientId) {
          return { error: 'Unauthorized: Referral mismatch.' };
        }

        // 5. Hydrate the destination facility safely
        let destinationFacility = 'Unknown Facility';
        if (activeReferral.destinationFacilityId) {
          try {
            const facility = await facilitiesService.findOne(activeReferral.destinationFacilityId);
            destinationFacility = facility.name;
          } catch (e) {
            console.error('Failed to resolve facility for referral:', e);
          }
        }

        // 6. Return safe structured result
        return {
          hasReferral: true,
          referral: {
            status: activeReferral.status,
            destinationFacility,
            createdAt: activeReferral.createdAt,
            reason: activeReferral.reason,
            priority: activeReferral.priority,
          }
        };
      } catch (error: any) {
        if (error.status === 404) {
          return { status: 'PATIENT_NOT_FOUND', message: 'Patient not found.' };
        }
        throw error;
      }
    },
  };
}
