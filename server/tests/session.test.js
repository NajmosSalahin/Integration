import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'integration-session-'));
const envFile = join(dir, '.env.test');
writeFileSync(envFile, 'JWT_SECRET=test-access-secret\nJWT_REFRESH_SECRET=test-refresh-secret\n');

const previousEnvFile = process.env.ENV_FILE;
process.env.ENV_FILE = envFile;

const { createSessionStore } = await import('../utils/session.js');
const { hashToken, verifyRefreshToken } = await import('../utils/token.js');

after(() => {
  if (previousEnvFile === undefined) {
    delete process.env.ENV_FILE;
  } else {
    process.env.ENV_FILE = previousEnvFile;
  }
  rmSync(dir, { recursive: true, force: true });
});

function createFakeSessionModel() {
  const sessions = new Map();

  return {
    sessions,
    async create(doc) {
      const record = { ...doc, _id: crypto.randomUUID() };
      sessions.set(record._id, record);
      return record;
    },
    async findOneAndUpdate(filter, update) {
      for (const record of sessions.values()) {
        if (record.tokenHash !== filter.tokenHash) continue;
        if (String(record.userId) !== String(filter.userId)) continue;
        if (filter.expiresAt?.$gt && record.expiresAt <= filter.expiresAt.$gt) continue;
        record.tokenHash = update.$set.tokenHash;
        record.expiresAt = update.$set.expiresAt;
        return record;
      }
      return null;
    },
    async deleteOne(filter) {
      for (const [id, record] of sessions) {
        if (record.tokenHash === filter.tokenHash) {
          sessions.delete(id);
          return { deletedCount: 1 };
        }
      }
      return { deletedCount: 0 };
    },
    async deleteMany(filter) {
      let deletedCount = 0;
      for (const [id, record] of sessions) {
        const matchesUser = filter.userId === undefined || String(record.userId) === String(filter.userId);
        const matchesFamily = filter.familyId === undefined || record.familyId === filter.familyId;
        if (matchesUser && matchesFamily) {
          sessions.delete(id);
          deletedCount += 1;
        }
      }
      return { deletedCount };
    },
  };
}

const user = { _id: '507f1f77bcf86cd799439011' };

test('createSession stores only a hash of the refresh token', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  const token = await store.createSession(user);
  const [[, session]] = [...SessionModel.sessions.entries()];
  const decoded = verifyRefreshToken(token);

  assert.equal(SessionModel.sessions.size, 1);
  assert.equal(session.tokenHash, hashToken(token));
  assert.notEqual(session.tokenHash, token);
  assert.equal(decoded.id, user._id);
  assert.equal(decoded.fid, session.familyId);
});

test('refresh tokens are single-use and reuse revokes the family', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  const token = await store.createSession(user);
  const decoded = verifyRefreshToken(token);
  const nextToken = await store.rotateSession(token, decoded, user);
  const [[, session]] = [...SessionModel.sessions.entries()];

  assert.ok(nextToken);
  assert.notEqual(nextToken, token);
  assert.equal(session.tokenHash, hashToken(nextToken));

  assert.equal(await store.rotateSession(token, decoded, user), null);
  assert.equal(SessionModel.sessions.size, 0);
  assert.equal(await store.rotateSession(nextToken, verifyRefreshToken(nextToken), user), null);
});

test('logout revokes only the current device session', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  const firstToken = await store.createSession(user);
  const secondToken = await store.createSession(user);
  await store.revokeSession(firstToken);

  assert.equal(SessionModel.sessions.size, 1);
  assert.ok(await store.rotateSession(secondToken, verifyRefreshToken(secondToken), user));
});

test('password changes revoke every session for the user', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  await store.createSession(user);
  await store.createSession(user);
  await store.createSession({ _id: '507f1f77bcf86cd799439012' });
  await store.revokeAllSessions(user._id);

  assert.equal(SessionModel.sessions.size, 1);
});

test('expired sessions cannot be rotated', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  const token = await store.createSession(user);
  const [[, session]] = [...SessionModel.sessions.entries()];
  session.expiresAt = new Date(Date.now() - 1000);

  assert.equal(await store.rotateSession(token, verifyRefreshToken(token), user), null);
});
