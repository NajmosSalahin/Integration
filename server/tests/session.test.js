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
const {
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} = await import('../utils/token.js');

after(() => {
  if (previousEnvFile === undefined) {
    delete process.env.ENV_FILE;
  } else {
    process.env.ENV_FILE = previousEnvFile;
  }
  rmSync(dir, { recursive: true, force: true });
});

function createClock(start = '2026-01-01T00:00:00.000Z') {
  let current = new Date(start);

  return {
    now: () => new Date(current),
    advance(ms) {
      current = new Date(current.getTime() + ms);
    },
  };
}

function matches(record, filter) {
  if (filter.$or) {
    return filter.$or.some((clause) => matches(record, clause));
  }
  if (filter._id !== undefined && String(record._id) !== String(filter._id)) {
    return false;
  }
  if (filter.tokenHash !== undefined && record.tokenHash !== filter.tokenHash) {
    return false;
  }
  if (filter.userId !== undefined && String(record.userId) !== String(filter.userId)) {
    return false;
  }
  if (filter.familyId !== undefined && record.familyId !== filter.familyId) {
    return false;
  }
  if (
    filter.expiresAt?.$gt &&
    new Date(record.expiresAt).getTime() <= new Date(filter.expiresAt.$gt).getTime()
  ) {
    return false;
  }
  if (filter['previousTokenHashes.hash'] !== undefined) {
    const found = (record.previousTokenHashes || []).some(
      (entry) => entry.hash === filter['previousTokenHashes.hash']
    );
    if (!found) {
      return false;
    }
  }
  if (filter.previousTokenHashes?.$elemMatch) {
    const { hash, graceUntil } = filter.previousTokenHashes.$elemMatch;
    const found = (record.previousTokenHashes || []).some(
      (entry) =>
        entry.hash === hash &&
        (!graceUntil?.$gt ||
          new Date(entry.graceUntil).getTime() > new Date(graceUntil.$gt).getTime())
    );
    if (!found) {
      return false;
    }
  }
  return true;
}

function createFakeSessionModel() {
  const sessions = new Map();

  return {
    sessions,
    async create(doc) {
      const record = {
        ...doc,
        _id: crypto.randomUUID(),
        previousTokenHashes: [...(doc.previousTokenHashes || [])],
      };
      sessions.set(record._id, record);
      return record;
    },
    async findOneAndUpdate(filter, update) {
      for (const record of sessions.values()) {
        if (!matches(record, filter)) continue;
        if (update.$set) {
          for (const [key, value] of Object.entries(update.$set)) {
            record[key] = value;
          }
        }
        if (update.$push?.previousTokenHashes) {
          record.previousTokenHashes = [
            ...(record.previousTokenHashes || []),
            { ...update.$push.previousTokenHashes },
          ];
        }
        return record;
      }
      return null;
    },
    async findOne(filter) {
      for (const record of sessions.values()) {
        if (matches(record, filter)) return record;
      }
      return null;
    },
    async updateOne(filter, update) {
      for (const record of sessions.values()) {
        if (!matches(record, filter)) continue;
        if (update.$pull?.previousTokenHashes) {
          const pull = update.$pull.previousTokenHashes;
          record.previousTokenHashes = (record.previousTokenHashes || []).filter((entry) => {
            if (!pull.graceUntil?.$lte) return true;
            return new Date(entry.graceUntil).getTime() > new Date(pull.graceUntil.$lte).getTime();
          });
        }
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    },
    async deleteOne(filter) {
      for (const [id, record] of sessions) {
        if (matches(record, filter)) {
          sessions.delete(id);
          return { deletedCount: 1 };
        }
      }
      return { deletedCount: 0 };
    },
    async deleteMany(filter) {
      let deletedCount = 0;
      for (const [id, record] of sessions) {
        if (matches(record, filter)) {
          sessions.delete(id);
          deletedCount += 1;
        }
      }
      return { deletedCount };
    },
  };
}

const user = { _id: '507f1f77bcf86cd799439011' };

test('createSession returns the session id and stores only a hash', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  const { refreshToken, sessionId } = await store.createSession(user);
  const session = SessionModel.sessions.get(sessionId);
  const decoded = verifyRefreshToken(refreshToken);

  assert.ok(session);
  assert.equal(session.tokenHash, hashToken(refreshToken));
  assert.notEqual(session.tokenHash, refreshToken);
  assert.equal(decoded.id, user._id);
  assert.equal(decoded.fid, session.familyId);
  assert.deepEqual(session.previousTokenHashes, []);
});

test('rotation returns a new token and keeps the old hash during grace', async () => {
  const clock = createClock();
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel, { now: clock.now, graceMs: 30000 });

  const { refreshToken, sessionId } = await store.createSession(user);
  const decoded = verifyRefreshToken(refreshToken);
  const result = await store.rotateSession(refreshToken, decoded, user);
  const session = SessionModel.sessions.get(sessionId);

  assert.equal(result.rotated, true);
  assert.equal(result.sessionId, sessionId);
  assert.ok(result.refreshToken);
  assert.notEqual(result.refreshToken, refreshToken);
  assert.equal(session.tokenHash, hashToken(result.refreshToken));
  assert.equal(session.previousTokenHashes.length, 1);
  assert.equal(session.previousTokenHashes[0].hash, hashToken(refreshToken));
  assert.equal(
    session.previousTokenHashes[0].graceUntil.getTime(),
    clock.now().getTime() + 30000
  );
});

test('a replay inside the grace window does not rotate again', async () => {
  const clock = createClock();
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel, { now: clock.now, graceMs: 30000 });

  const { refreshToken, sessionId } = await store.createSession(user);
  const decoded = verifyRefreshToken(refreshToken);
  const first = await store.rotateSession(refreshToken, decoded, user);
  const expiresAt = SessionModel.sessions.get(sessionId).expiresAt;
  const replay = await store.rotateSession(refreshToken, decoded, user);
  const session = SessionModel.sessions.get(sessionId);

  assert.equal(replay.rotated, false);
  assert.equal(replay.refreshToken, null);
  assert.equal(replay.sessionId, sessionId);
  assert.equal(session.tokenHash, hashToken(first.refreshToken));
  assert.equal(session.previousTokenHashes.length, 1);
  assert.equal(session.expiresAt, expiresAt);
});

test('a replay after the grace window revokes the family', async () => {
  const clock = createClock();
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel, { now: clock.now, graceMs: 30000 });

  const { refreshToken } = await store.createSession(user);
  const decoded = verifyRefreshToken(refreshToken);
  await store.rotateSession(refreshToken, decoded, user);
  clock.advance(30001);

  assert.equal(await store.rotateSession(refreshToken, decoded, user), null);
  assert.equal(SessionModel.sessions.size, 0);
});

test('multiple rotations keep each recent old token inside grace', async () => {
  const clock = createClock();
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel, { now: clock.now, graceMs: 30000 });

  const { refreshToken: tokenA } = await store.createSession(user);
  const decodedA = verifyRefreshToken(tokenA);
  const first = await store.rotateSession(tokenA, decodedA, user);
  clock.advance(10000);
  const decodedB = verifyRefreshToken(first.refreshToken);
  const second = await store.rotateSession(first.refreshToken, decodedB, user);

  const replayA = await store.rotateSession(tokenA, decodedA, user);
  const replayB = await store.rotateSession(first.refreshToken, decodedB, user);
  const currentC = await store.rotateSession(
    second.refreshToken,
    verifyRefreshToken(second.refreshToken),
    user
  );

  assert.equal(replayA.rotated, false);
  assert.equal(replayB.rotated, false);
  assert.equal(currentC.rotated, true);
  assert.equal(SessionModel.sessions.size, 1);
});

test('an unknown token in the family revokes the session', async () => {
  const clock = createClock();
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel, { now: clock.now });

  const { refreshToken } = await store.createSession(user);
  const decoded = verifyRefreshToken(refreshToken);
  const forged = generateRefreshToken(user, decoded.fid);

  assert.equal(await store.rotateSession(forged, verifyRefreshToken(forged), user), null);
  assert.equal(SessionModel.sessions.size, 0);
});

test('logout revokes the session when presented a grace token', async () => {
  const clock = createClock();
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel, { now: clock.now });

  const { refreshToken } = await store.createSession(user);
  const decoded = verifyRefreshToken(refreshToken);
  await store.rotateSession(refreshToken, decoded, user);
  await store.revokeSession(refreshToken);

  assert.equal(SessionModel.sessions.size, 0);
});

test('logout revokes only the current device session', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  const first = await store.createSession(user);
  const second = await store.createSession(user);
  await store.revokeSession(first.refreshToken);

  assert.equal(SessionModel.sessions.size, 1);
  assert.ok(
    await store.rotateSession(second.refreshToken, verifyRefreshToken(second.refreshToken), user)
  );
});

test('password changes revoke every session for the user', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  await store.createSession(user);
  await store.createSession(user);
  const other = await store.createSession({ _id: '507f1f77bcf86cd799439012' });
  await store.revokeAllSessions(user._id);

  assert.equal(SessionModel.sessions.size, 1);
  assert.ok(SessionModel.sessions.has(other.sessionId));
});

test('expired sessions cannot be rotated', async () => {
  const SessionModel = createFakeSessionModel();
  const store = createSessionStore(SessionModel);

  const { refreshToken, sessionId } = await store.createSession(user);
  SessionModel.sessions.get(sessionId).expiresAt = new Date(Date.now() - 1000);

  assert.equal(await store.rotateSession(refreshToken, verifyRefreshToken(refreshToken), user), null);
});
