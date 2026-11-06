export function requireVerifiedEmail(req, res, next) {
  if (!req.user?.emailVerified) {
    return res.status(403).json({
      error: 'Please verify your email before placing an order',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
}
