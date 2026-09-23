import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { MockAiProvider } from './providers/mock.provider';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    // Force AI_PROVIDER to mock for testing
    process.env.AI_PROVIDER = 'mock';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateText', () => {
    it('should return successful connection message for Setu Saathi prompt', async () => {
      const prompt = 'You are Setu Saathi, the AI assistant of NIVARA HEALTHCARE.\n\nReply with exactly:\n\n"NIVARA HEALTHCARE AI is connected successfully."';
      const result = await service.generateText(prompt);
      expect(result).toBe('NIVARA HEALTHCARE AI is connected successfully.');
    });

    it('should return mock response for other prompts', async () => {
      const prompt = 'Test prompt';
      const result = await service.generateText(prompt);
      expect(result).toBe('Mock text response for prompt: Test prompt');
    });
  });
});
