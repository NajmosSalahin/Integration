import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const serverDir = fileURLToPath(new URL('..', import.meta.url));

function cleanEnv(extra = {}) {
  const env = { ...process.env };
  delete env.JWT_SECRET;
  delete env.JWT_REFRESH_SECRET;
  delete env.ENV_FILE;
  return { ...env, NODE_ENV: 'test', ...extra };
}

function runNode(script, env) {
  return spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: serverDir,
    env,
    encoding: 'utf8',
  });
}

test('config loads JWT secrets from the configured env file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'integration-config-'));
  const envFile = join(dir, '.env.test');
  writeFileSync(envFile, 'JWT_SECRET=test-access-secret\nJWT_REFRESH_SECRET=test-refresh-secret\n');

  try {
    const result = runNode(
      "import { JWT_SECRET, JWT_REFRESH_SECRET } from './config.js'; console.log(JSON.stringify({ JWT_SECRET, JWT_REFRESH_SECRET }));",
      cleanEnv({ ENV_FILE: envFile }),
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      JWT_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('config fails fast when a JWT secret is missing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'integration-config-'));
  const envFile = join(dir, '.env.test');
  writeFileSync(envFile, 'JWT_REFRESH_SECRET=test-refresh-secret\n');

  try {
    const result = runNode("import './config.js';", cleanEnv({ ENV_FILE: envFile }));

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /JWT_SECRET is not set/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('token.js signs with the configured secrets instead of the removed fallback', () => {
  const dir = mkdtempSync(join(tmpdir(), 'integration-config-'));
  const envFile = join(dir, '.env.test');
  writeFileSync(envFile, 'JWT_SECRET=test-access-secret\nJWT_REFRESH_SECRET=test-refresh-secret\n');

  try {
    const result = runNode(
      "import jwt from 'jsonwebtoken'; import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './utils/token.js'; const token = generateAccessToken({ _id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'admin' }); const refresh = generateRefreshToken({ _id: '507f1f77bcf86cd799439011' }); console.log(JSON.stringify({ role: jwt.verify(token, 'test-access-secret').role, refreshId: verifyRefreshToken(refresh).id }));",
      cleanEnv({ ENV_FILE: envFile }),
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      role: 'admin',
      refreshId: '507f1f77bcf86cd799439011',
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
