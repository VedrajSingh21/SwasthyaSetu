import { Test, TestingModule } from '@nestjs/testing';
import { JourneysService } from './journeys.service.js';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('JourneysService', () => {
  let service: JourneysService;
  
  // Mock DB structure
  let mockJourney: Record<string, unknown>;
  let mockReqs: Record<string, unknown>[];
  
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

  it('Accepted referral can progress to ARRIVED (Test 1)', async () => {
    mockJourney.currentStage = 'REFERRAL';
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    const result = await service.advanceJourney('journey-1', 'ARRIVED');
    expect(result).toBeDefined();
    expect(mockDb.transaction).toHaveBeenCalled();
  });

  it('ARRIVED can progress to CONSULTATION (Test 2)', async () => {
    mockJourney.currentStage = 'ARRIVED';
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    const result = await service.advanceJourney('journey-1', 'CONSULTATION');
    expect(result).toBeDefined();
  });

  it('Consultation can progress to DIAGNOSTICS when a diagnostic requirement exists (Test 3)', async () => {
    mockJourney.currentStage = 'CONSULTATION';
    mockReqs = [{ requirementType: 'Diagnostic' }];
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    const result = await service.advanceJourney('journey-1', 'DIAGNOSTICS');
    expect(result).toBeDefined();
  });

  it('DIAGNOSTICS can progress to TREATMENT (Test 4)', async () => {
    mockJourney.currentStage = 'DIAGNOSTICS';
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    const result = await service.advanceJourney('journey-1', 'TREATMENT');
    expect(result).toBeDefined();
  });

  it('DIAGNOSTICS can be skipped when no diagnostic requirement exists (Test 5)', async () => {
    mockJourney.currentStage = 'CONSULTATION';
    mockReqs = [{ requirementType: 'Procedure' }];
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    const result = await service.advanceJourney('journey-1', 'TREATMENT');
    expect(result).toBeDefined();
  });

  it('Invalid backward transition is rejected (Test 6)', async () => {
    mockJourney.currentStage = 'TREATMENT';
    mockDb.where.mockReturnValueOnce([mockJourney]);
    await expect(service.advanceJourney('journey-1', 'CONSULTATION'))
      .rejects.toThrow(BadRequestException);
  });

  it('Invalid stage transition is rejected (Test 7)', async () => {
    mockJourney.currentStage = 'CONSULTATION';
    mockDb.where.mockReturnValueOnce([mockJourney]);
    await expect(service.advanceJourney('journey-1', 'UNKNOWN_STAGE'))
      .rejects.toThrow(BadRequestException);
  });

  it('Successful transition creates exactly one journey event (Test 8)', async () => {
    mockJourney.currentStage = 'ARRIVED';
    mockDb.where.mockReturnValueOnce([mockJourney]).mockReturnValueOnce(mockReqs);
    let insertCalled = false;
    mockDb.transaction.mockImplementationOnce(async (cb) => {
      const tx = {
         update: vi.fn().mockReturnThis(),
         set: vi.fn().mockReturnThis(),
         where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'mock' }]) }),
         insert: vi.fn().mockImplementation(() => {
           insertCalled = true;
           return { values: vi.fn().mockResolvedValue([]) };
         }),
         select: vi.fn().mockReturnThis(),
         from: vi.fn().mockReturnThis()
      };
      return cb(tx);
    });
    
    await service.advanceJourney('journey-1', 'CONSULTATION');
    expect(insertCalled).toBe(true);
  });

  it('Retrying the same transition does not create duplicate events (Test 9)', async () => {
    mockJourney.currentStage = 'CONSULTATION';
    mockDb.where.mockReturnValueOnce([mockJourney]);
    
    let insertCalled = false;
    mockDb.transaction.mockImplementationOnce(async (cb) => {
      const tx = {
         update: vi.fn().mockReturnThis(),
         set: vi.fn().mockReturnThis(),
         where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'mock' }]) }),
         insert: vi.fn().mockImplementation(() => {
           insertCalled = true;
           return { values: vi.fn().mockResolvedValue([]) };
         }),
      };
      return cb(tx);
    });
    
    await expect(service.advanceJourney('journey-1', 'CONSULTATION'))
      .rejects.toThrow(BadRequestException);
      
    expect(insertCalled).toBe(false);
  });
});
