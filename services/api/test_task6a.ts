import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { ReferralsService } from './src/modules/referrals/referrals.service.js';
import { FacilitiesService } from './src/modules/facilities/facilities.service.js';
import { DynamicRoutingService } from './src/modules/dynamic-routing/dynamic-routing.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const referralsService = app.get(ReferralsService);
  const facilitiesService = app.get(FacilitiesService);
  const routingService = app.get(DynamicRoutingService);

  const demoFacilityId = 'b654125d-f4d4-49e7-84e3-d9c73105b316'; // Demo Hospital B
  
  console.log('1. Facility Referral List');
  const list = await facilitiesService.findFacilityReferrals(demoFacilityId);
  console.log('Found referrals:', list.length);
  const referralId = list[0]?.id;
  console.log('Referral ID:', referralId);
  console.log('Referral Status:', list[0]?.status);

  if (referralId && list[0].status === 'PENDING') {
    console.log('2. Status Update (PENDING -> ACCEPTED)');
    await referralsService.updateStatus(referralId, { status: 'ACCEPTED' });
    const accepted = await facilitiesService.findFacilityReferrals(demoFacilityId);
    console.log('New status:', accepted.find(r => r.id === referralId)?.status);

    console.log('3. Invalid Transition (ACCEPTED -> PENDING)');
    try {
      await referralsService.updateStatus(referralId, { status: 'PENDING' } as any);
      console.log('FAILED: Should have thrown error');
    } catch (e: any) {
      console.log('Caught expected error:', e.message);
    }
  }

  console.log('4. Missing Resources');
  try {
    await facilitiesService.findFacilityReferrals('00000000-0000-0000-0000-000000000000');
    console.log('FAILED: Should have thrown error');
  } catch (e: any) {
    console.log('Caught expected error:', e.message);
  }

  try {
    await referralsService.updateStatus('00000000-0000-0000-0000-000000000000', { status: 'ACCEPTED' });
    console.log('FAILED: Should have thrown error');
  } catch (e: any) {
    console.log('Caught expected error:', e.message);
  }

  console.log('5. Dynamic Routing Recovery Endpoint Exists');
  console.log(typeof routingService.recoverReferral === 'function');

  await app.close();
}

bootstrap();
