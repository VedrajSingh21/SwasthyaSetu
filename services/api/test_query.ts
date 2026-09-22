import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({path: '../../.env'});
const sql = postgres(process.env.DATABASE_URL!);
sql`SELECT * FROM referrals WHERE status='PENDING' LIMIT 1`.then(async r => {
  console.log(r);
  const events = await sql`SELECT * FROM referral_events WHERE referral_id=${r[0].id}`;
  console.log(events);
}).finally(() => sql.end());
