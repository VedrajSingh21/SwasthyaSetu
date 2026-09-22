import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/swasthyasetu');

async function migrate() {
  try {
    console.log('Adding ARRIVED...');
    await sql`ALTER TYPE care_journey_stage ADD VALUE IF NOT EXISTS 'ARRIVED'`;
  } catch (e) { console.error(e.message); }
  
  try {
    console.log('Adding CONSULTATION...');
    await sql`ALTER TYPE care_journey_stage ADD VALUE IF NOT EXISTS 'CONSULTATION'`;
  } catch (e) { console.error(e.message); }
  
  try {
    console.log('Adding DIAGNOSTICS...');
    await sql`ALTER TYPE care_journey_stage ADD VALUE IF NOT EXISTS 'DIAGNOSTICS'`;
  } catch (e) { console.error(e.message); }

  console.log('Done!');
  await sql.end();
}

migrate();
