import { Test, TestingModule } from '@nestjs/testing';
import { CareRequirementsController } from './care-requirements.controller.js';
import { JourneysService } from './journeys.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CareRequirementsController', () => {
  let controller: CareRequirementsController;
  let service: JourneysService;

  const mockJourneysService = {
    markRequirementCompleted: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareRequirementsController],
      providers: [
        {
          provide: JourneysService,
          useValue: mockJourneysService,
        },
      ],
    }).compile();

    controller = module.get<CareRequirementsController>(CareRequirementsController);
    service = module.get<JourneysService>(JourneysService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call markRequirementCompleted', async () => {
    const mockReq = { id: 'req-1', status: 'COMPLETED' };
    mockJourneysService.markRequirementCompleted.mockResolvedValueOnce(mockReq);
    
    const result = await controller.completeRequirement('req-1');
    
    expect(service.markRequirementCompleted).toHaveBeenCalledWith('req-1');
    expect(result).toEqual(mockReq);
  });
});
