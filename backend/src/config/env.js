import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'is required'),
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters long'),
  CLIENT_URL: z.string().min(1, 'is required'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration. Check backend/.env:');
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')} ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  ...result.data,
  isProduction: result.data.NODE_ENV === 'production',
  clientOrigins: result.data.CLIENT_URL.split(',').map((origin) => origin.trim().replace(/\/$/, '')),
};
