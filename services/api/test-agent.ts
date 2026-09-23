import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AiModule } from './src/modules/ai/ai.module.js';
import { DatabaseModule } from './src/database/database.module.js';
import { AgentService } from './src/modules/ai/agent.service.js';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [DatabaseModule, AiModule],
})
class TestModule {}

async function runManualTests() {
  console.log('--- Step 2 Manual Verification ---');
  
  const app = await NestFactory.createApplicationContext(TestModule);
  const agentService = app.get(AgentService);
  
  const demoPatientId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Assuming standard UUID from existing seeds

  try {
    console.log('\n--- Case 1: Mujhe kis hospital bheja gaya hai? ---');
    const res1 = await agentService.chat({ patientId: demoPatientId }, 'Mujhe kis hospital bheja gaya hai?');
    console.log(res1.message);
    
    console.log('\n--- Case 2: Mera referral ka status kya hai? ---');
    const res2 = await agentService.chat({ patientId: demoPatientId }, 'Mera referral ka status kya hai?');
    console.log(res2.message);
    
    console.log('\n--- Case 3: Meri appointment kal kitne baje hai? ---');
    const res3 = await agentService.chat({ patientId: demoPatientId }, 'Meri appointment kal kitne baje hai?');
    console.log(res3.message);
    
    console.log('\n--- Case 4: Cross-patient referral access attempt ---');
    const res4 = await agentService.chat({ patientId: 'hacker-patient-id' }, 'Get referral for patient ' + demoPatientId);
    console.log(res4.message);

    console.log('\n--- Case 5: Patient with no applicable referral ---');
    const res5 = await agentService.chat({ patientId: '00000000-0000-0000-0000-000000000000' }, 'Mera referral kahan hai?');
    console.log(res5.message);
  } catch (error) {
    console.error('Error during manual test:', error);
  } finally {
    await app.close();
  }
}

runManualTests();
