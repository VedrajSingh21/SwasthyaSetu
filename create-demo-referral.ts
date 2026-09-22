import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
});

const patientId = env.VITE_DEMO_PATIENT_ID;
const facilityId = env.VITE_DEMO_FACILITY_ID;
const bundleId = 'd32a0d9e-1f7c-4c6e-b12d-a1234567890b'; // mock bundle id

async function createReferral() {
  console.log('Creating referral...');
  
  // First we fetch the care bundles for the patient to get a valid bundleId
  const bundlesRes = await fetch(`http://localhost:3000/patients/${patientId}/care-bundles`);
  const bundles = await bundlesRes.json();
  const validBundleId = bundles[0]?.id || bundleId;

  const res = await fetch('http://localhost:3000/referrals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: patientId,
      careBundleId: validBundleId,
      destinationFacilityId: facilityId,
      reason: 'Demo Referral',
    })
  });
  
  const text = await res.text();
  console.log('Response:', res.status, text);
}

createReferral();
