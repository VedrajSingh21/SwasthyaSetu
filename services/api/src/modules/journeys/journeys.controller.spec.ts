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

  it('should call advanceJourney', async () => {
    const mockUpdatedJourney = { id: 'test-id', currentStage: 'CONSULTATION' };
    mockJourneysService.advanceJourney.mockResolvedValueOnce(mockUpdatedJourney);
    
    const result = await controller.advanceJourney('test-id', { requestedStage: 'CONSULTATION', actorId: 'doc-1', notes: 'test' });
    
    expect(service.advanceJourney).toHaveBeenCalledWith('test-id', 'CONSULTATION', 'doc-1', 'test');
    expect(result).toEqual(mockUpdatedJourney);
  });
});
