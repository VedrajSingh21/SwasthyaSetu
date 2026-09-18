import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateReferralStatusDto {
  @IsEnum(['ACCEPTED', 'COMPLETED'])
  @IsNotEmpty()
  status: 'ACCEPTED' | 'COMPLETED';
}
