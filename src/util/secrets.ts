import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

function throwIfUndefined<T>(secret: T | undefined, name?: string): T {
  if (!secret) {
    logger.error(`${name} must not be undefined`);
    return process.exit(1);
  }
  return secret;
}

export const MONGO_URL = throwIfUndefined(process.env.MONGO_URL, 'MONGO_URL');
