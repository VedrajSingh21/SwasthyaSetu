import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGetCurrentReferralTool } from './get-current-referral.tool.js';

describe('GetCurrentReferralTool', () => {
  const mockPatientsService = {
    findReferrals: vi.fn(),
  } as any;

  const mockFacilitiesService = {
    findOne: vi.fn(),
  } as any;

  const tool = createGetCurrentReferralTool(mockPatientsService, mockFacilitiesService);
  const context = { patientId: 'patient-1', language: 'hi' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the active referral and resolve facility name', async () => {
    mockPatientsService.findReferrals.mockResolvedValueOnce([
      { id: 'ref-1', patientId: 'patient-1', status: 'COMPLETED', destinationFacilityId: 'fac-1', createdAt: new Date('2023-01-01') },
      { id: 'ref-2', patientId: 'patient-1', status: 'PENDING', destinationFacilityId: 'fac-2', createdAt: new Date('2023-02-01') },
      { id: 'ref-3', patientId: 'patient-1', status: 'CANCELLED', destinationFacilityId: 'fac-3', createdAt: new Date('2023-03-01') },
    ]);
    mockFacilitiesService.findOne.mockResolvedValueOnce({ name: 'City Hospital' });

    const result = await tool.execute(context, { patientId: 'patient-1' });

    expect(result).toEqual({
      hasReferral: true,
      referral: {
        status: 'PENDING',
        destinationFacility: 'City Hospital',
        createdAt: new Date('2023-02-01'),
        reason: undefined,
        priority: undefined,
      }
    });
    expect(mockFacilitiesService.findOne).toHaveBeenCalledWith('fac-2');
  });

  it('should return no active referral if all are completed or cancelled', async () => {
    mockPatientsService.findReferrals.mockResolvedValueOnce([
      { id: 'ref-1', patientId: 'patient-1', status: 'COMPLETED' },
      { id: 'ref-2', patientId: 'patient-1', status: 'CANCELLED' },
    ]);

    const result = await tool.execute(context, { patientId: 'patient-1' });
    expect(result).toEqual({ hasReferral: false, message: 'The patient does not currently have an active referral.' });
  });

  it('should prevent cross-patient access', async () => {
    const result = await tool.execute(context, { patientId: 'patient-2' });
    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/Unauthorized/);
    expect(mockPatientsService.findReferrals).not.toHaveBeenCalled();
  });
});
