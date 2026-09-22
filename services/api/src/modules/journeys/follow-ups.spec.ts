import { Test, TestingModule } from '@nestjs/testing';
import { JourneysService } from './journeys.service.js';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { careJourneys, careJourneyEvents, followUps } from '../../database/schema/journeys.js';
import { careRequirements } from '../../database/schema/care.js';
import { referrals } from '../../database/schema/referrals.js';

vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm') as any;
  return {
    ...actual,
    eq: (col: any, val: any) => ({ col, val })
  };
});

describe('JourneysService - Phase 9E Follow-ups', () => {
  let service: JourneysService;
  
  // mock database state
  let mockDb: any;
  let mockTx: any;
  
  let requirementsStore: any[] = [];
  let journeysStore: any[] = [];
  let followUpsStore: any[] = [];
  let eventsStore: any[] = [];
  let referralsStore: any[] = [];

  beforeEach(async () => {
    requirementsStore = [];
    journeysStore = [];
    followUpsStore = [];
    eventsStore = [];
    referralsStore = [];

    mockTx = {
      update: vi.fn((table) => {
        return {
          set: vi.fn((data) => {
            return {
              where: vi.fn((condition) => {
                const val = condition.val;

                if (table.requirementType || table.name === 'care_requirements') {
                   const req = requirementsStore.find(r => r.id === val) || requirementsStore[requirementsStore.length - 1];
                   if (req) {
                     Object.assign(req, data);
                     return { returning: () => [req] };
                   }
                }
                else if (table.currentStage || table.name === 'care_journeys') {
                   const journey = journeysStore.find(j => j.id === val || j.careBundleId === val) || journeysStore[journeysStore.length - 1];
                   if (journey) {
                     Object.assign(journey, data);
                     return { returning: () => [journey] };
                   }
                }
                else if (table.scheduledDate || table.name === 'follow_ups') {
                   const followUp = followUpsStore.find(f => f.id === val || f.careBundleId === val) || followUpsStore[followUpsStore.length - 1];
                   if (followUp) {
                     Object.assign(followUp, data);
                     return { returning: () => [followUp] };
                   }
                }
                
                // Fallback
                if (requirementsStore.length > 0) {
                   const req = requirementsStore[requirementsStore.length - 1];
                   Object.assign(req, data);
                   return { returning: () => [req] };
                }

                return { returning: () => [{ id: 'updated-id', ...data }] };
              })
            }
          })
        }
      }),
      select: vi.fn((fields) => {
        return {
          from: vi.fn((table) => {
            return {
              where: vi.fn(async (condition) => {
                const val = condition?.val;
                let res: any[] = [];
                
                if (table.requirementType || table.name === 'care_requirements') {
                  const filtered = requirementsStore.filter(r => r.careBundleId === val || r.id === val);
                  res = filtered.length ? filtered : requirementsStore;
                }
                else if (table.currentStage || table.name === 'care_journeys') {
                  const filtered = journeysStore.filter(j => j.careBundleId === val || j.id === val);
                  res = filtered.length ? filtered : journeysStore;
                }
                else if (table.scheduledDate || table.name === 'follow_ups') {
                  const filtered = followUpsStore.filter(f => f.careBundleId === val || f.id === val);
                  res = filtered.length ? filtered : followUpsStore;
                }
                else if (table.destinationFacilityId || table.name === 'referrals') {
                  const filtered = referralsStore.filter(r => r.careBundleId === val);
                  res = filtered.length ? filtered : referralsStore;
                } else {
                  // Fallback
                  res = requirementsStore;
                }
                
                return Promise.resolve(res);
              })
            }
          })
        }
      }),
      insert: vi.fn((table) => {
        return {
          values: vi.fn((data) => {
            if (table.scheduledDate || table.name === 'follow_ups') {
               const newRecord = { ...data, id: 'new-follow-up-id' };
               followUpsStore.push(newRecord);
            }
            if (table.eventType || table.name === 'care_journey_events') {
               eventsStore.push(data);
            }
          })
        }
      })
    };

    mockDb = {
      transaction: vi.fn(async (cb) => cb(mockTx)),
      select: mockTx.select,
      update: mockTx.update,
    };

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

  it('1/14. Treatment completion without Follow-up requirement -> normal completion', async () => {
    journeysStore.push({ id: 'j1', patientId: 'p1', careBundleId: 'cb1', status: 'IN_PROGRESS', currentStage: 'TREATMENT' });
    requirementsStore.push({ id: 'r1', careBundleId: 'cb1', requirementType: 'Procedure', status: 'PENDING' });
    
    await service.markRequirementCompleted('r1');
    
    expect(journeysStore[0].status).toBe('COMPLETED');
    expect(eventsStore.length).toBe(1);
    expect(eventsStore[0].eventType).toBe('CARE_COMPLETED');
    expect(followUpsStore.length).toBe(0);
  });

  it('2/3/4/5. Treatment completion with Follow-up requirement -> creates follow-up, journey moves to FOLLOW_UP', async () => {
    journeysStore.push({ id: 'j2', patientId: 'p2', careBundleId: 'cb2', status: 'IN_PROGRESS', currentStage: 'TREATMENT' });
    referralsStore.push({ id: 'ref2', careBundleId: 'cb2' });
    requirementsStore.push({ id: 'r2', careBundleId: 'cb2', requirementType: 'Procedure', status: 'PENDING' });
    requirementsStore.push({ id: 'r3', careBundleId: 'cb2', requirementType: 'Follow-up', status: 'PENDING' });
    
    await service.markRequirementCompleted('r2');
    
    // Journey should NOT be completed
    expect(journeysStore[0].status).toBe('IN_PROGRESS');
    // Journey moves to FOLLOW_UP
    expect(journeysStore[0].currentStage).toBe('FOLLOW_UP');
    
    // Correct event created
    expect(eventsStore.length).toBe(1);
    expect(eventsStore[0].stage).toBe('FOLLOW_UP');
    expect(eventsStore[0].eventType).toBe('STAGE_ADVANCED');

    // Follow-up created
    expect(followUpsStore.length).toBe(1);
    expect(followUpsStore[0].patientId).toBe('p2');
    expect(followUpsStore[0].referralId).toBe('ref2');
    expect(followUpsStore[0].status).toBe('PENDING');

    // Follow-up requirement remains incomplete
    expect(requirementsStore.find(r => r.id === 'r3').status).toBe('PENDING');
  });

  it('6/7. Retrying treatment completion does not create duplicate follow-ups', async () => {
    journeysStore.push({ id: 'j3', patientId: 'p3', careBundleId: 'cb3', status: 'IN_PROGRESS', currentStage: 'FOLLOW_UP' });
    requirementsStore.push({ id: 'r4', careBundleId: 'cb3', requirementType: 'Procedure', status: 'COMPLETED' });
    requirementsStore.push({ id: 'r5', careBundleId: 'cb3', requirementType: 'Follow-up', status: 'PENDING' });
    
    // simulate existing follow up
    followUpsStore.push({ id: 'f1', careBundleId: 'cb3', status: 'PENDING' });

    // retry completion
    await service.markRequirementCompleted('r4');

    expect(followUpsStore.length).toBe(1); // STILL 1
    expect(eventsStore.length).toBe(0); // no new stage event
  });

  it('8/9/10/11. Follow-up completion marks follow-up completed, requirement completed, journey CARE_COMPLETED, exactly one event', async () => {
    journeysStore.push({ id: 'j4', patientId: 'p4', careBundleId: 'cb4', status: 'IN_PROGRESS', currentStage: 'FOLLOW_UP' });
    requirementsStore.push({ id: 'r6', careBundleId: 'cb4', requirementType: 'Procedure', status: 'COMPLETED' });
    requirementsStore.push({ id: 'r7', careBundleId: 'cb4', requirementType: 'Follow-up', status: 'PENDING' });
    followUpsStore.push({ id: 'f2', careBundleId: 'cb4', status: 'PENDING' });

    await service.completeFollowUp('f2');

    // follow-up is completed
    expect(followUpsStore[0].status).toBe('COMPLETED');
    expect(followUpsStore[0].completedAt).toBeDefined();

    // requirement is completed
    expect(requirementsStore.find(r => r.id === 'r7').status).toBe('COMPLETED');

    // journey is CARE_COMPLETED (status COMPLETED)
    expect(journeysStore[0].status).toBe('COMPLETED');

    // exactly one CARE_COMPLETED event
    expect(eventsStore.length).toBe(1);
    expect(eventsStore[0].eventType).toBe('CARE_COMPLETED');
    expect(eventsStore[0].metadata.reason).toBe('All care requirements completed');
  });

  it('12. Already-completed follow-up cannot be completed again', async () => {
    followUpsStore.push({ id: 'f3', status: 'COMPLETED' });
    
    await expect(service.completeFollowUp('f3')).rejects.toThrow('Follow-up is already completed');
  });

});
