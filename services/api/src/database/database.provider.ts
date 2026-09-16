import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../../.env') });

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProvider: Provider = {
  provide: DATABASE_CONNECTION,
  useFactory: () => {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/swasthyasetu';
    const queryClient = postgres(connectionString);
    return drizzle(queryClient, { schema });
  },
};
