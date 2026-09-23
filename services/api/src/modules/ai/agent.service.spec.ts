import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service.js';
import { AiService } from './ai.service.js';
import { PatientsService } from '../patients/patients.service.js';
import { AgentContext } from './agent.types.js';

describe('AgentService', () => {
  let service: AgentService;
  let aiServiceMock: any;
  let patientsServiceMock: any;

  beforeEach(async () => {
    aiServiceMock = {
      chat: vi.fn(),
    };
    
    patientsServiceMock = {
      findJourneys: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: AiService, useValue: aiServiceMock },
        { provide: PatientsService, useValue: patientsServiceMock },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should answer about journey securely', async () => {
    // LLM says it needs the getCurrentJourney tool
    aiServiceMock.chat.mockResolvedValueOnce({
      functionCalls: [{ name: 'getCurrentJourney', args: { patientId: 'patient1' } }]
    });
    // LLM receives the tool output and returns friendly text
    aiServiceMock.chat.mockResolvedValueOnce({
      text: 'Aapka doctor se consultation ho chuka hai. Abhi ECG janch baaki hai.'
    });

    patientsServiceMock.findJourneys.mockResolvedValue([
      { id: 'j1', patientId: 'patient1', status: 'IN_PROGRESS', currentStage: 'DIAGNOSTICS', events: [], requirements: [{ status: 'PENDING', serviceName: 'ECG' }] }
    ]);

    const context: AgentContext = { patientId: 'patient1' };
    const res = await service.chat(context, 'Mera ilaaj kaha tak pahucha?');
    
    expect(res.message).toBe('Aapka doctor se consultation ho chuka hai. Abhi ECG janch baaki hai.');
    expect(patientsServiceMock.findJourneys).toHaveBeenCalledWith('patient1');
  });

  it('should not allow mismatching patientId', async () => {
    // LLM tries to query for a different patient
    aiServiceMock.chat.mockResolvedValueOnce({
      functionCalls: [{ name: 'getCurrentJourney', args: { patientId: 'patient2' } }]
    });
    aiServiceMock.chat.mockResolvedValueOnce({
      text: 'Access denied text.'
    });

    const context: AgentContext = { patientId: 'patient1' };
    await service.chat(context, 'Mera ilaaj kaha tak pahucha?');
    
    // patientsService should NOT be called since the tool itself rejects it
    expect(patientsServiceMock.findJourneys).not.toHaveBeenCalled();
  });
});
