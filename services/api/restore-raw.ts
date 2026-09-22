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
const demoFacilityId = 'b654125d-f4d4-49e7-84e3-d9c73105b316';

async function run() {
  try {
    console.log(`Restoring services at ${demoFacilityId}...`);
    await sql`
      UPDATE facility_services 
      SET availability_status = true 
      WHERE facility_id = ${demoFacilityId}
    `;
    console.log(`Restored.`);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
