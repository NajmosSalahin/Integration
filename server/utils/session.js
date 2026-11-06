import crypto from 'crypto';
import Session from '../models/Session.js';
import { generateRefreshToken, hashToken, REFRESH_TOKEN_TTL_MS } from './token.js';

export const REFRESH_ROTATION_GRACE_MS = 30 * 1000;

export function createSessionStore(SessionModel, options = {}) {
  const now = options.now || (() => new Date());
  const graceMs = options.graceMs ?? REFRESH_ROTATION_GRACE_MS;

  async function createSession(user) {
    const familyId = crypto.randomUUID();
    const refreshToken = generateRefreshToken(user, familyId);
    const currentTime = now();

    const session = await SessionModel.create({
      userId: user._id,
      familyId,
      tokenHash: hashToken(refreshToken),
      previousTokenHashes: [],
      expiresAt: new Date(currentTime.getTime() + REFRESH_TOKEN_TTL_MS),
    });

    return { refreshToken, sessionId: session._id };
  }

  async function rotateSession(refreshToken, decoded, user) {
    if (!decoded.fid) {
      return null;
    }

    const currentTime = now();
    const tokenHash = hashToken(refreshToken);
    const nextToken = generateRefreshToken(user, decoded.fid);
    const nextExpiresAt = new Date(currentTime.getTime() + REFRESH_TOKEN_TTL_MS);
    const graceUntil = new Date(currentTime.getTime() + graceMs);

    const session = await SessionModel.findOneAndUpdate(
      {
        tokenHash,
        userId: user._id,
        familyId: decoded.fid,
        expiresAt: { $gt: currentTime },
      },
      {
        $set: {
          tokenHash: hashToken(nextToken),
          expiresAt: nextExpiresAt,
        },
        $push: {
          previousTokenHashes: { hash: tokenHash, graceUntil },
        },
      },
      { new: true }
    );

    if (session) {
      await SessionModel.updateOne(
        { _id: session._id },
        { $pull: { previousTokenHashes: { graceUntil: { $lte: currentTime } } } }
      );
      return { refreshToken: nextToken, sessionId: session._id, rotated: true };
    }

    const graceSession = await SessionModel.findOne({
      userId: user._id,
      familyId: decoded.fid,
      expiresAt: { $gt: currentTime },
      previousTokenHashes: {
        $elemMatch: { hash: tokenHash, graceUntil: { $gt: currentTime } },
      },
    });

    if (graceSession) {
      return { refreshToken: null, sessionId: graceSession._id, rotated: false };
    }

    await SessionModel.deleteMany({ userId: user._id, familyId: decoded.fid });
    return null;
  }

  async function revokeSession(refreshToken) {
    if (!refreshToken) {
      return;
    }

    const tokenHash = hashToken(refreshToken);
    await SessionModel.deleteOne({
      $or: [
        { tokenHash },
        { 'previousTokenHashes.hash': tokenHash },
      ],
    });
  }

  async function revokeAllSessions(userId) {
    await SessionModel.deleteMany({ userId });
  }

  return { createSession, rotateSession, revokeSession, revokeAllSessions };
}

export const sessionStore = createSessionStore(Session);
