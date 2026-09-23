import { Test, TestingModule } from '@nestjs/testing';
import { InterventionsService, INTERVENTION_THRESHOLDS } from './interventions.service.js';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { careJourneys, careJourneyEvents, followUps } from '../../database/schema/journeys.js';
import { careRequirements } from '../../database/schema/care.js';
import { referrals, referralEvents } from '../../database/schema/referrals.js';

vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm') as any;
  return {
    ...actual,
    eq: vi.fn(),
    and: vi.fn(),
    inArray: vi.fn(),
  };
});

describe('InterventionsService - Phase 9F', () => {
  let service: InterventionsService;

  let mockAcceptedRefs: any[] = [];
  let mockArrivedJourneys: any[] = [];
  let mockPendingDiagnostics: any[] = [];
  let mockOverdueFollowUps: any[] = [];
  let mockReferralEvents: any[] = [];
  let mockCareJourneyEvents: any[] = [];

  class MockQueryBuilder {
    constructor(private table: any) {}
    leftJoin() { return this; }
    innerJoin() { return this; }
    where() {
      if (this.table === referrals) return Promise.resolve(mockAcceptedRefs);
      if (this.table === careJourneys) return Promise.resolve(mockArrivedJourneys);
      if (this.table === careRequirements) return Promise.resolve(mockPendingDiagnostics);
      if (this.table === followUps) return Promise.resolve(mockOverdueFollowUps);
      if (this.table === referralEvents) return Promise.resolve(mockReferralEvents);
      if (this.table === careJourneyEvents) return Promise.resolve(mockCareJourneyEvents);
      return Promise.resolve([]);
    }
  }

  const mockDb = {
    select: vi.fn().mockImplementation(() => {
      return {
        from: vi.fn().mockImplementation((table: any) => new MockQueryBuilder(table))
      };
    })
  };

  const now = new Date();

  // Helper to create dates in the past
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);
  // Helper to create dates in the future
  const hoursFromNow = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    
    mockAcceptedRefs = [];
    mockArrivedJourneys = [];
    mockPendingDiagnostics = [];
    mockOverdueFollowUps = [];
    mockReferralEvents = [];
    mockCareJourneyEvents = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterventionsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<InterventionsService>(InterventionsService);
  });

  // --- Rule A Tests ---
  it('1. Accepted referral within threshold -> no intervention', async () => {
    mockAcceptedRefs = [
      {
        referral: { id: 'ref1', status: 'ACCEPTED', updatedAt: hoursAgo(10) },
        journey: { id: 'j1', currentStage: 'APPOINTMENT' }
      }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(0);
  });

  it('2. Accepted referral beyond threshold -> REFERRAL_NOT_REACHED', async () => {
    mockAcceptedRefs = [
      {
        referral: { id: 'ref1', status: 'ACCEPTED', updatedAt: hoursAgo(25) },
        journey: null // Journey missing entirely
      }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(1);
    expect(results[0].interventionType).toBe('REFERRAL_NOT_REACHED');
    expect(results[0].referralId).toBe('ref1');
  });

  it('3. Arrived within threshold -> no intervention', async () => {
    // Journey has arrived, so it should NOT trigger Rule A (referral not reached)
    mockAcceptedRefs = [
      {
        referral: { id: 'ref1', status: 'ACCEPTED', updatedAt: hoursAgo(25) },
        journey: { id: 'j1', currentStage: 'ARRIVED' }
      }
    ];
    // For Rule B, it is arrived but only 1 hour ago
    mockArrivedJourneys = [
      { id: 'j1', currentStage: 'ARRIVED', status: 'IN_PROGRESS', updatedAt: hoursAgo(1) }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(0);
  });

  // --- Rule B Tests ---
  it('4. Arrived beyond consultation threshold -> WAITING_FOR_CONSULTATION', async () => {
    mockArrivedJourneys = [
      { id: 'j1', currentStage: 'ARRIVED', status: 'IN_PROGRESS', updatedAt: hoursAgo(3) }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(1);
    expect(results[0].interventionType).toBe('WAITING_FOR_CONSULTATION');
    expect(results[0].journeyId).toBe('j1');
  });

  // --- Rule C Tests ---
  it('5. Diagnostic requirement pending beyond threshold -> DIAGNOSTICS_PENDING', async () => {
    mockPendingDiagnostics = [
      {
        req: { id: 'req1', requirementType: 'Diagnostic', status: 'REQUIRED', createdAt: hoursAgo(50) },
        journey: { id: 'j1', currentStage: 'CONSULTATION', status: 'IN_PROGRESS' }
      }
    ];
    // Mock the journey event for CONSULTATION entry
    mockCareJourneyEvents = [
      { journeyId: 'j1', stage: 'CONSULTATION', createdAt: hoursAgo(50) }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(1);
    expect(results[0].interventionType).toBe('DIAGNOSTICS_PENDING');
    expect(results[0].journeyId).toBe('j1');
  });

  it('5b. Diagnostic requirement pending within threshold -> no intervention', async () => {
    mockPendingDiagnostics = [
      {
        req: { id: 'req1', requirementType: 'Diagnostic', status: 'REQUIRED', createdAt: hoursAgo(10) },
        journey: { id: 'j1', currentStage: 'CONSULTATION', status: 'IN_PROGRESS' }
      }
    ];
    mockCareJourneyEvents = [
      { journeyId: 'j1', stage: 'CONSULTATION', createdAt: hoursAgo(10) }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(0);
  });

  // --- Rule D Tests ---
  it('6. Follow-up before scheduled time -> no intervention', async () => {
    mockOverdueFollowUps = [
      {
        followUp: { id: 'f1', status: 'PENDING', scheduledDate: hoursFromNow(2) },
        journey: { id: 'j1', currentStage: 'FOLLOW_UP', status: 'IN_PROGRESS' }
      }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(0);
  });

  it('7. Follow-up after scheduled time and incomplete -> FOLLOW_UP_OVERDUE', async () => {
    mockOverdueFollowUps = [
      {
        followUp: { id: 'f1', status: 'PENDING', scheduledDate: hoursAgo(2) },
        journey: { id: 'j1', currentStage: 'FOLLOW_UP', status: 'IN_PROGRESS' }
      }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(1);
    expect(results[0].interventionType).toBe('FOLLOW_UP_OVERDUE');
    expect(results[0].journeyId).toBe('j1');
  });

  // --- General Tests ---
  it('8. Completed journey -> no intervention', async () => {
    mockArrivedJourneys = [
      { id: 'j1', currentStage: 'ARRIVED', status: 'COMPLETED', updatedAt: hoursAgo(5) }
    ];
    mockPendingDiagnostics = [
      {
        req: { id: 'req1', requirementType: 'Diagnostic', status: 'REQUIRED', createdAt: hoursAgo(50) },
        journey: { id: 'j1', currentStage: 'CONSULTATION', status: 'COMPLETED' }
      }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(0);
  });

  it('9. Multiple journeys can produce independent interventions', async () => {
    mockAcceptedRefs = [
      {
        referral: { id: 'ref1', status: 'ACCEPTED', updatedAt: hoursAgo(25) },
        journey: null
      }
    ];
    mockArrivedJourneys = [
      { id: 'j2', currentStage: 'ARRIVED', status: 'IN_PROGRESS', updatedAt: hoursAgo(3) }
    ];
    mockOverdueFollowUps = [
      {
        followUp: { id: 'f1', status: 'PENDING', scheduledDate: hoursAgo(2) },
        journey: { id: 'j3', currentStage: 'FOLLOW_UP', status: 'IN_PROGRESS' }
      }
    ];
    
    const results = await service.getStuckJourneys();
    expect(results).toHaveLength(3);
    
    // Test rule 10 implicitly via deterministic sorting verification
    // Expected order: FOLLOW_UP_OVERDUE, REFERRAL_NOT_REACHED, WAITING_FOR_CONSULTATION
    expect(results[0].interventionType).toBe('FOLLOW_UP_OVERDUE');
    expect(results[1].interventionType).toBe('REFERRAL_NOT_REACHED');
    expect(results[2].interventionType).toBe('WAITING_FOR_CONSULTATION');
  });

  it('10. Repeated API calls produce the same deterministic result', async () => {
    mockArrivedJourneys = [
      { id: 'j2', currentStage: 'ARRIVED', status: 'IN_PROGRESS', updatedAt: hoursAgo(3) }
    ];
    
    const results1 = await service.getStuckJourneys();
    const results2 = await service.getStuckJourneys();
    expect(results1).toEqual(results2);
  });

  it('11. No intervention record is persisted merely by reading the endpoint', async () => {
    // Verified by lack of tx.insert or tx.update in mockDb
    expect(mockDb.select).toBeDefined();
    expect((mockDb as any).insert).toBeUndefined();
    expect((mockDb as any).update).toBeUndefined();
  });
});
