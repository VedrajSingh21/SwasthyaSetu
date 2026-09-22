import { Test, TestingModule } from '@nestjs/testing';
import { JourneysService } from './journeys.service.js';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('JourneysService', () => {
  let service: JourneysService;
  
  // Mock DB structure
  let mockJourney: any;
  let mockReqs: any[];
  
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockImplementation(() => {
      // Very simplified mock
      return mockReqs || [mockJourney];
    }),
    transaction: vi.fn().mockImplementation(async (cb) => {
       const tx = {
         update: vi.fn().mockReturnThis(),
         set: vi.fn().mockReturnThis(),
         where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'mock', status: 'UPDATED' }]) }),
         insert: vi.fn().mockReturnThis(),
         values: vi.fn().mockResolvedValue([]),
         select: vi.fn().mockReturnThis(),
         from: vi.fn().mockReturnThis()
       };
       return cb(tx);
    })
  };

  beforeEach(async () => {
    mockJourney = { id: 'journey-1', currentStage: 'APPOINTMENT', careBundleId: 'bundle-1', status: 'ACTIVE' };
    mockReqs = [];
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneysService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<JourneysService>(JourneysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('valid transition: APPOINTMENT to ARRIVED', async () => {
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    const result = await service.advanceJourney('journey-1', 'ARRIVED');
    expect(result).toBeDefined();
    expect(mockDb.transaction).toHaveBeenCalled();
  });

  it('invalid transition: backwards', async () => {
    mockJourney.currentStage = 'ARRIVED';
    mockDb.where.mockReturnValueOnce([mockJourney]);
    
    await expect(service.advanceJourney('journey-1', 'APPOINTMENT'))
      .rejects.toThrow(BadRequestException);
  });

  it('skip DIAGNOSTICS if none required', async () => {
    mockJourney.currentStage = 'CONSULTATION';
    mockReqs = [{ requirementType: 'Procedure' }]; // No diagnostics
    
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    
    const result = await service.advanceJourney('journey-1', 'TREATMENT');
    expect(result).toBeDefined();
  });

  it('prevent skipping DIAGNOSTICS if required', async () => {
    mockJourney.currentStage = 'CONSULTATION';
    mockReqs = [{ requirementType: 'Diagnostic' }, { requirementType: 'Procedure' }];
    
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    
    await expect(service.advanceJourney('journey-1', 'TREATMENT'))
      .rejects.toThrow(BadRequestException);
  });
});
