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

async function run() {
  try {
    const patients = await sql`SELECT id, name FROM patients LIMIT 5`;
    console.log('Patients:', patients);
    
    const facilities = await sql`SELECT id, name FROM facilities LIMIT 5`;
    console.log('Facilities:', facilities);
    
    const bundles = await sql`SELECT id, patient_id FROM care_bundles LIMIT 5`;
    console.log('Bundles:', bundles);
    
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
