import { generateEmailToken, hashToken } from './token.js';

export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export function createVerification() {
  const token = generateEmailToken();

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
  };
}
