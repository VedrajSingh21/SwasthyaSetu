import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.provider.js';

@Injectable()
export class FacilitiesService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async findAll() {
    return this.db.query.facilities.findMany();
  }
}
