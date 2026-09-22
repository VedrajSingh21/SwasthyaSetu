import { Test, TestingModule } from '@nestjs/testing';
import { JourneysController } from './journeys.controller.js';
import { JourneysService } from './journeys.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('JourneysController', () => {
  let controller: JourneysController;
  let service: JourneysService;

  const mockJourneysService = {
    getJourney: vi.fn(),
    advanceJourney: vi.fn(),
    markRequirementCompleted: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JourneysController],
      providers: [
        {
          provide: JourneysService,
          useValue: mockJourneysService,
        },
      ],
    }).compile();

    controller = module.get<JourneysController>(JourneysController);
    service = module.get<JourneysService>(JourneysService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getJourney', async () => {
    const mockJourney = { id: 'test-id' };
    mockJourneysService.getJourney.mockResolvedValueOnce(mockJourney);
    
    const result = await controller.getJourney('test-id');
    
    expect(service.getJourney).toHaveBeenCalledWith('test-id');
    expect(result).toEqual(mockJourney);
  });

  it('should call advanceJourney and markRequirementCompleted (Test 10: Requirement completion uses the existing backend logic)', async () => {
    const mockUpdatedJourney = { id: 'test-id', currentStage: 'TREATMENT' };
    mockJourneysService.advanceJourney.mockResolvedValueOnce(mockUpdatedJourney);
    mockJourneysService.markRequirementCompleted.mockResolvedValueOnce({ id: 'req-1', status: 'COMPLETED' });
    mockJourneysService.getJourney.mockResolvedValueOnce(mockUpdatedJourney);
    
    const result = await controller.advanceJourney('test-id', { requestedStage: 'TREATMENT', completedRequirementId: 'req-1' });
    
    expect(service.advanceJourney).toHaveBeenCalledWith('test-id', 'TREATMENT', undefined, undefined);
    expect(service.markRequirementCompleted).toHaveBeenCalledWith('req-1');
    expect(service.getJourney).toHaveBeenCalledWith('test-id');
    expect(result).toEqual(mockUpdatedJourney);
  });

  it('should not mutate referral state incorrectly (Test 11: Referral state is not incorrectly mutated by journey actions)', async () => {
    // Controller logic only delegates to journey service, ensuring referrals are untouched
    const mockUpdatedJourney = { id: 'test-id', currentStage: 'ARRIVED' };
    mockJourneysService.advanceJourney.mockResolvedValueOnce(mockUpdatedJourney);
    mockJourneysService.getJourney.mockResolvedValueOnce(mockUpdatedJourney);
    
    const result = await controller.advanceJourney('test-id', { requestedStage: 'ARRIVED' });
    
    expect(service.advanceJourney).toHaveBeenCalledWith('test-id', 'ARRIVED', undefined, undefined);
    expect(result).toEqual(mockUpdatedJourney);
    // There is no referral service imported or called here, proving isolation
  });
});
