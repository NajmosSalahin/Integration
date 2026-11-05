import crypto from 'crypto';
import Session from '../models/Session.js';
import { generateRefreshToken, hashToken, REFRESH_TOKEN_TTL_MS } from './token.js';

export function createSessionStore(SessionModel) {
  async function createSession(user) {
    const familyId = crypto.randomUUID();
    const refreshToken = generateRefreshToken(user, familyId);

    await SessionModel.create({
      userId: user._id,
      familyId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return refreshToken;
  }

  async function rotateSession(refreshToken, decoded, user) {
    if (!decoded.fid) {
      return null;
    }

    const nextToken = generateRefreshToken(user, decoded.fid);
    const session = await SessionModel.findOneAndUpdate(
      {
        tokenHash: hashToken(refreshToken),
        userId: user._id,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          tokenHash: hashToken(nextToken),
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
      },
      { new: true }
    );

    if (!session) {
      await SessionModel.deleteMany({ userId: user._id, familyId: decoded.fid });
      return null;
    }

    return nextToken;
  }

  async function revokeSession(refreshToken) {
    if (!refreshToken) {
      return;
    }

    await SessionModel.deleteOne({ tokenHash: hashToken(refreshToken) });
  }

  async function revokeAllSessions(userId) {
    await SessionModel.deleteMany({ userId });
  }

  return { createSession, rotateSession, revokeSession, revokeAllSessions };
}

export const sessionStore = createSessionStore(Session);
