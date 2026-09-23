import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '../../.env' });
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`ALTER TYPE requirement_type ADD VALUE IF NOT EXISTS 'Follow-up'`;
    console.log('Successfully added Follow-up enum value');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

run();
