import { AiService } from './src/modules/ai/ai.service';
import * as dotenv from 'dotenv';
dotenv.config();

// Script to manually test the Gemini connection
// Ensure MODEL_API_KEY is set in your .env file and AI_PROVIDER=gemini

async function testConnection() {
  console.log('Testing Gemini connection...');
  console.log(`AI_PROVIDER: ${process.env.AI_PROVIDER}`);
  
  if (process.env.AI_PROVIDER !== 'gemini') {
    console.warn('AI_PROVIDER is not set to gemini. This will test the mock provider instead.');
    console.warn('To test the real connection, set AI_PROVIDER=gemini in .env');
  }

  try {
    const service = new AiService();
    const prompt = 'You are Setu Saathi, the AI assistant of NIVARA HEALTHCARE.\n\nReply with exactly:\n\n"NIVARA HEALTHCARE AI is connected successfully."';
    console.log(`Prompting with: \n"${prompt}"\n`);
    
    const result = await service.generateText(prompt);
    console.log('\n--- Result ---');
    console.log(result);
    console.log('--------------');
    
    if (result === 'NIVARA HEALTHCARE AI is connected successfully.') {
      console.log('SUCCESS: Connection and generation work perfectly.');
    } else {
      console.log('NOTE: Response did not exactly match expected output. This might be fine if using the real model and it added quotes or extra text.');
    }
  } catch (error) {
    console.error('FAILED to connect or generate text:');
    console.error(error);
  }
}

testConnection();
