import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn } from 'class-validator';

export class ProcessAssessmentDto {
  @IsUUID('4', { message: 'Invalid patientId UUID format' })
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  patientReportedSymptoms: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsString()
  @IsOptional()
  additionalContext?: string;
}
