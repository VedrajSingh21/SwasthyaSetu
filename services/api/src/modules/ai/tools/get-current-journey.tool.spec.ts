import { createGetCurrentJourneyTool } from './get-current-journey.tool.js';

describe('getCurrentJourney tool', () => {
  it('should return unauthorized if context patientId does not match input', async () => {
    const mockService = {} as any;
    const tool = createGetCurrentJourneyTool(mockService);
    
    const result = await tool.execute({ patientId: 'patientA' }, { patientId: 'patientB' });
    expect(result).toEqual({ error: 'Unauthorized: Cannot access journey for another patient.' });
  });

  it('should return NO_ACTIVE_JOURNEY if there are no active journeys', async () => {
    const mockService = { findJourneys: vi.fn().mockResolvedValue([{ status: 'COMPLETED' }]) } as any;
    const tool = createGetCurrentJourneyTool(mockService);
    
    const result = await tool.execute({ patientId: 'patientA' }, { patientId: 'patientA' });
    expect(result).toEqual({ status: 'NO_ACTIVE_JOURNEY', message: 'The patient does not currently have an active care journey.' });
  });

  it('should return structured journey data correctly', async () => {
    const activeJourney = {
      id: 'journey1',
      patientId: 'patientA',
      status: 'IN_PROGRESS',
      currentStage: 'DIAGNOSTICS',
      events: [{ stage: 'ASSESSMENT', eventType: 'STAGE_ADVANCED', createdAt: new Date() }],
      requirements: [{ id: 'req1', requirementType: 'Diagnostic', serviceName: 'ECG', status: 'PENDING', priority: 'High' }]
    };
    
    const mockService = { findJourneys: vi.fn().mockResolvedValue([activeJourney]) } as any;
    const tool = createGetCurrentJourneyTool(mockService);
    
    const result = await tool.execute({ patientId: 'patientA' }, { patientId: 'patientA' });
    expect((result as any).currentStage).toBe('DIAGNOSTICS');
    expect((result as any).pendingRequirements[0].serviceName).toBe('ECG');
  });
});
