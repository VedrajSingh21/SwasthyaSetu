import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { eq } from 'drizzle-orm';
import { patients } from '../../database/schema/patients.js';

@Injectable()
export class PatientsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async findAll() {
    return this.db.query.patients.findMany();
  }

  async findOne(id: string) {
    const patient = await this.db.select().from(patients).where(eq(patients.id, id));
    if (!patient || patient.length === 0) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient[0];
  }
}
