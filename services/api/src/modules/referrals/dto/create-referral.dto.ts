import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateReferralDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  careBundleId: string;

  @IsUUID()
  destinationFacilityId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
