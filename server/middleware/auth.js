import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized — no token' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'Not authorized — user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized — invalid token' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden — admin access required' });
  }
  next();
}
