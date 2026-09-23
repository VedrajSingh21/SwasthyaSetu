import { AgentTool, AgentContext } from '../agent.types.js';
import { PatientsService } from '../../patients/patients.service.js';

export interface GetCurrentJourneyInput {
  patientId: string;
}

export function createGetCurrentJourneyTool(patientsService: PatientsService): AgentTool<GetCurrentJourneyInput> {
  return {
    name: 'getCurrentJourney',
    description: 'Retrieves the current active healthcare journey for the patient. Use this to answer questions about the patient\'s current treatment status, stage, and requirements.',
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
    execute: async (context: AgentContext, input: GetCurrentJourneyInput) => {
      // 1. Enforce Patient Isolation
      if (context.patientId !== input.patientId) {
        return { error: 'Unauthorized: Cannot access journey for another patient.' };
      }

      try {
        // 2. Fetch journeys using the existing business logic
        const journeys = await patientsService.findJourneys(input.patientId);

        // 3. Find the active journey
        // A journey is active if its status is not 'COMPLETED'.
        const activeJourney = journeys.find((j: any) => j.status !== 'COMPLETED');

        if (!activeJourney) {
          return { status: 'NO_ACTIVE_JOURNEY', message: 'The patient does not currently have an active care journey.' };
        }

        // 4. Also verify the journey actually belongs to the patient (redundant check, but enforces security)
        if (activeJourney.patientId !== context.patientId) {
          return { error: 'Unauthorized: Journey mismatch.' };
        }

        // 5. Structure the output safely, omitting internal fields
        return {
          journeyId: activeJourney.id,
          currentStage: activeJourney.currentStage,
          status: activeJourney.status,
          events: activeJourney.events.map((e: any) => ({
            stage: e.stage,
            eventType: e.eventType,
            createdAt: e.createdAt,
          })),
          requirements: activeJourney.requirements.map((r: any) => ({
            id: r.id,
            requirementType: r.requirementType,
            serviceName: r.serviceName,
            status: r.status,
            priority: r.priority,
          })),
          pendingRequirements: activeJourney.requirements
            .filter((r: any) => r.status !== 'COMPLETED')
            .map((r: any) => ({ serviceName: r.serviceName, type: r.requirementType })),
          completedRequirements: activeJourney.requirements
            .filter((r: any) => r.status === 'COMPLETED')
            .map((r: any) => ({ serviceName: r.serviceName, type: r.requirementType })),
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
