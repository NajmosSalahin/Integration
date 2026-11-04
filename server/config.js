import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultEnvFile = process.env.NODE_ENV === 'production'
  ? join(__dirname, '../.env.production')
  : join(__dirname, '../.env.development');

dotenv.config({ path: process.env.ENV_FILE || defaultEnvFile });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export const JWT_SECRET = requireEnv('JWT_SECRET');
export const JWT_REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET');
