import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'integration-verification-'));
const envFile = join(dir, '.env.test');
writeFileSync(envFile, 'JWT_SECRET=test-access-secret\nJWT_REFRESH_SECRET=test-refresh-secret\n');

const previousEnvFile = process.env.ENV_FILE;
process.env.ENV_FILE = envFile;

const { createVerification, VERIFICATION_TTL_MS } = await import('../utils/verification.js');
const { hashToken } = await import('../utils/token.js');

after(() => {
  if (previousEnvFile === undefined) {
    delete process.env.ENV_FILE;
  } else {
    process.env.ENV_FILE = previousEnvFile;
  }
  rmSync(dir, { recursive: true, force: true });
});

test('verification tokens are hashed before storage', () => {
  const verification = createVerification();
  assert.match(verification.token, /^[0-9a-f]{64}$/);
  assert.equal(verification.tokenHash, hashToken(verification.token));
});

test('verification tokens expire after 24 hours', () => {
  const before = Date.now();
  const { expiresAt } = createVerification();
  const after = Date.now();
  assert.ok(expiresAt.getTime() >= before + VERIFICATION_TTL_MS);
  assert.ok(expiresAt.getTime() <= after + VERIFICATION_TTL_MS);
});

test('each verification token is unique', () => {
  const first = createVerification();
  const second = createVerification();
  assert.notEqual(first.token, second.token);
  assert.notEqual(first.tokenHash, second.tokenHash);
});
