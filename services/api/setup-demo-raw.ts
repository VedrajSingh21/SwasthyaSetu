import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["'\r]/g, '');
});

const sql = postgres(env.DATABASE_URL);
const demoPatientId = '58721f5d-ad13-4e5a-bee9-29eec2e5869c';
const demoFacilityId = 'b654125d-f4d4-49e7-84e3-d9c73105b316';
const bundleId = '394643ed-3092-45c8-a06e-72f0332da1a7'; 

async function run() {
  try {
    console.log('Cleaning up old demo referrals/journeys...');
    await sql`DELETE FROM referral_events WHERE referral_id IN (SELECT id FROM referrals WHERE patient_id = ${demoPatientId})`;
    await sql`DELETE FROM care_journey_events WHERE journey_id IN (SELECT id FROM care_journeys WHERE patient_id = ${demoPatientId})`;
    await sql`DELETE FROM referrals WHERE patient_id = ${demoPatientId}`;
    await sql`DELETE FROM care_journeys WHERE patient_id = ${demoPatientId}`;

    console.log('Skipping Care Journey creation...');

    // Create steps for CareJourneyVisual (using jsonb mock steps, or we can just rely on the API to return the steps array if it generates them, wait - the schema doesn't have a JSON steps column? Let's check journeys schema if possible. The frontend CareJourney type has 'steps').
    // Actually the mock schema might generate them or we just use it as is.
    
    console.log('Creating Referral...');
    const [referral] = await sql`
      INSERT INTO referrals (patient_id, care_bundle_id, destination_facility_id, status, reason, priority)
      VALUES (${demoPatientId}, ${bundleId}, ${demoFacilityId}, 'PENDING', 'Demo Referral', 'Medium')
      RETURNING id
    `;

    await sql`
      INSERT INTO referral_events (referral_id, event_type, new_status, metadata)
      VALUES (${referral.id}, 'CREATED', 'PENDING', '{"note": "demo"}')
    `;

    console.log(`Success! Created Referral: ${referral.id}`);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
