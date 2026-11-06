import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import jwt from 'jsonwebtoken';

const dir = mkdtempSync(join(tmpdir(), 'integration-auth-middleware-'));
const envFile = join(dir, '.env.test');
writeFileSync(envFile, 'JWT_SECRET=test-access-secret\nJWT_REFRESH_SECRET=test-refresh-secret\n');

const previousEnvFile = process.env.ENV_FILE;
process.env.ENV_FILE = envFile;

const { createProtect } = await import('../middleware/auth.js');
const { generateAccessToken } = await import('../utils/token.js');

after(() => {
  if (previousEnvFile === undefined) {
    delete process.env.ENV_FILE;
  } else {
    process.env.ENV_FILE = previousEnvFile;
  }
  rmSync(dir, { recursive: true, force: true });
});

const userId = '507f1f77bcf86cd799439011';
const sessionId = '507f1f77bcf86cd799439012';
const user = { _id: userId, name: 'Test User', email: 'test@example.com', role: 'customer' };
const session = { _id: sessionId, userId, expiresAt: new Date(Date.now() + 60_000) };

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function createSessionModel(record) {
  return {
    findById(id) {
      return {
        select: async () => (record && String(record._id) === String(id) ? record : null),
      };
    },
  };
}

function createUserModel(record) {
  return {
    findById(id) {
      return {
        select: async () => (record && String(record._id) === String(id) ? record : null),
      };
    },
  };
}

async function run({ authorization, sessionRecord = session, userRecord = user }) {
  const protect = createProtect({
    SessionModel: createSessionModel(sessionRecord),
    UserModel: createUserModel(userRecord),
  });
  const req = { headers: authorization ? { authorization } : {} };
  const res = createRes();
  let nextCalled = false;

  await protect(req, res, () => {
    nextCalled = true;
  });

  return { req, res, nextCalled };
}

test('a valid session-bound token reaches the next handler', async () => {
  const token = generateAccessToken(user, sessionId);
  const { req, res, nextCalled } = await run({ authorization: `Bearer ${token}` });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
  assert.equal(req.user, user);
  assert.equal(req.sessionId, sessionId);
});

test('a missing token is rejected', async () => {
  const { res, nextCalled } = await run({});

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /no token/);
});

test('a token without a session id is rejected', async () => {
  const token = jwt.sign({ id: userId, role: 'customer' }, 'test-access-secret', {
    expiresIn: '10m',
  });
  const { res, nextCalled } = await run({ authorization: `Bearer ${token}` });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test('a revoked session is rejected', async () => {
  const token = generateAccessToken(user, sessionId);
  const { res, nextCalled } = await run({
    authorization: `Bearer ${token}`,
    sessionRecord: null,
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test('an expired session is rejected', async () => {
  const token = generateAccessToken(user, sessionId);
  const { res, nextCalled } = await run({
    authorization: `Bearer ${token}`,
    sessionRecord: { ...session, expiresAt: new Date(Date.now() - 1000) },
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test('a session belonging to another user is rejected', async () => {
  const token = generateAccessToken(user, sessionId);
  const { res, nextCalled } = await run({
    authorization: `Bearer ${token}`,
    sessionRecord: { ...session, userId: '507f1f77bcf86cd799439099' },
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test('a token for a missing user is rejected', async () => {
  const token = generateAccessToken(user, sessionId);
  const { res, nextCalled } = await run({
    authorization: `Bearer ${token}`,
    userRecord: null,
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test('a malformed token is rejected', async () => {
  const { res, nextCalled } = await run({ authorization: 'Bearer not-a-jwt' });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});
