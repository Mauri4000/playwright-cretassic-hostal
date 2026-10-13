import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Config — centralised configuration.
 * Read once from .env / CI secrets and exposed as typed properties.
 */
export const Config = {
  baseUrl:      process.env.BASE_URL      ?? 'https://cretassichostal.com',
  adminUrl:     process.env.ADMIN_URL     ?? 'https://cretassic-hostal.vercel.app',
  testEmail:    process.env.TEST_EMAIL    ?? '',
  testPassword: process.env.TEST_PASSWORD ?? '',
  headless:     process.env.HEADLESS !== 'false',
  slowMo:       Number(process.env.SLOW_MO ?? 0),
} as const;
