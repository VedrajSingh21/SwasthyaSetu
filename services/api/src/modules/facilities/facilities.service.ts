import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';
import { eq } from 'drizzle-orm';
import { facilities } from '../../database/schema/facilities.js';

@Injectable()
export class FacilitiesService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async findAll() {
    return this.db.query.facilities.findMany();
  }

  async findOne(id: string) {
    const facility = await this.db.select().from(facilities).where(eq(facilities.id, id));
    if (!facility || facility.length === 0) {
      throw new NotFoundException(`Facility with ID ${id} not found`);
    }
    return facility[0];
  }
}
