import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { DATABASE_CONNECTION } from './src/database/database.provider.js';
import { eq, asc } from 'drizzle-orm';
import { referrals, referralEvents } from './src/database/schema/referrals.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DATABASE_CONNECTION);

  const referralId = '3b407ae3-be60-4ba5-9c6a-9ef009d5dc4d';
  
  const [ref] = await db.select().from(referrals).where(eq(referrals.id, referralId));
  const events = await db.select().from(referralEvents).where(eq(referralEvents.referralId, referralId)).orderBy(asc(referralEvents.createdAt));

  console.log('Referral ID:', ref?.id);
  console.log('Current Status:', ref?.status);
  console.log('Number of events:', events.length);
  events.forEach((e: any, i: number) => {
    console.log(`Event ${i + 1}: ${e.eventType} (Previous: ${e.previousStatus}, New: ${e.newStatus})`);
  });

  await app.close();
}

bootstrap();
