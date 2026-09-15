import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export default defineConfig({
  schema: './src/database/schema/*',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/swasthyasetu',
  },
});
