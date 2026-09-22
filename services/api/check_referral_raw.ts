import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, asc } from 'drizzle-orm';
import { referrals, referralEvents } from './src/database/schema/referrals.js';

async function check() {
  const queryClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/swasthya_setu');
  const db = drizzle(queryClient);

  const referralId = '3b407ae3-be60-4ba5-9c6a-9ef009d5dc4d';
  
  const [ref] = await db.select().from(referrals).where(eq(referrals.id, referralId));
  const events = await db.select().from(referralEvents).where(eq(referralEvents.referralId, referralId)).orderBy(asc(referralEvents.createdAt));

  console.log('Referral ID:', ref?.id);
  console.log('Current Status:', ref?.status);
  console.log('Number of events:', events.length);
  events.forEach((e: any, i: number) => {
    console.log(`Event ${i + 1}: ${e.eventType} (Previous: ${e.previousStatus}, New: ${e.newStatus})`);
  });

  process.exit(0);
}

check();
