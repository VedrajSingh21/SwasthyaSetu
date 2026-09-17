import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PatientsService } from './patients.service.js';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll() {
    const patients = await this.patientsService.findAll();
    return patients.map(this.minimizePatientData);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const patient = await this.patientsService.findOne(id);
    return this.minimizePatientData(patient);
  }

  private minimizePatientData(patient: any) {
    const { createdAt, updatedAt, userId, ...minimalPatient } = patient;
    return minimalPatient;
  }
}
