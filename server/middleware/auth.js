import { verifyAccessToken } from '../utils/token.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

export function createProtect({ SessionModel = Session, UserModel = User } = {}) {
  return async function protect(req, res, next) {
    try {
      let token;

      if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ error: 'Not authorized — no token' });
      }

      const decoded = verifyAccessToken(token);
      if (!decoded.sid || !decoded.id) {
        return res.status(401).json({ error: 'Not authorized — invalid token' });
      }

      const [session, user] = await Promise.all([
        SessionModel.findById(decoded.sid).select('userId expiresAt'),
        UserModel.findById(decoded.id).select('-passwordHash'),
      ]);

      if (
        !session ||
        !user ||
        String(session.userId) !== String(decoded.id) ||
        new Date(session.expiresAt).getTime() <= Date.now()
      ) {
        return res.status(401).json({ error: 'Not authorized — invalid token' });
      }

      req.user = user;
      req.sessionId = decoded.sid;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Not authorized — invalid token' });
    }
  };
}

export const protect = createProtect();

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden — admin access required' });
  }
  next();
}

export function requireSections(...sections) {
  return (req, res, next) => {
    if (req.user?.role !== 'admin' || !sections.some((s) => req.user.canManage(s))) {
      return res.status(403).json({ error: 'Forbidden — admin access required' });
    }
    next();
  };
}
