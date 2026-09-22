import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../../.env') });

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
  try {
    const patients = await sql`SELECT id FROM patients LIMIT 1`;
    const bundles = await sql`SELECT id FROM care_bundles LIMIT 1`;
    const facilities = await sql`SELECT id, name FROM facilities`;

    const patientId = patients[0].id;
    const bundleId = bundles[0].id;
    const facilityB = facilities.find(f => f.name.includes('Fully Equipped'))!.id;
    const facilityA = facilities.find(f => f.name.includes('No ECG'))!.id;

    console.log('--- STARTING TESTS ---');

    console.log('\n1. Test Valid Creation');
    let res = await fetch('http://localhost:3000/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        careBundleId: bundleId,
        destinationFacilityId: facilityB,
      })
    });
    console.log('Status:', res.status);
    let data = await res.json();
    console.log('Response:', data);

    console.log('\n2. Test Duplicate (Should be 409 Conflict)');
    res = await fetch('http://localhost:3000/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        careBundleId: bundleId,
        destinationFacilityId: facilityB,
      })
    });
    console.log('Status:', res.status);
    data = await res.json();
    console.log('Response:', data);

    console.log('\n3. Test NOT CARE_READY (Should be 400 Bad Request)');
    res = await fetch('http://localhost:3000/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        careBundleId: bundleId,
        destinationFacilityId: facilityA,
      })
    });
    console.log('Status:', res.status);
    data = await res.json();
    console.log('Response:', data);

    console.log('\n4. Test Invalid UUID (Should be 400 Bad Request)');
    res = await fetch('http://localhost:3001/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: 'not-a-uuid',
        careBundleId: bundleId,
        destinationFacilityId: facilityB,
      })
    });
    console.log('Status:', res.status);
    data = await res.json();
    console.log('Response:', data);

    // CLEANUP
    if (data && data.id) {
       // We can't delete via API easily, but we verified it works.
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
run();
