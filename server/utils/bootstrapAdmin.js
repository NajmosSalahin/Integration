import User from '../models/User.js';

export default async function bootstrapAdmin() {
  if (process.env.ALLOW_ADMIN_BOOTSTRAP !== 'true') return;

  const emailRaw = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!emailRaw) return;

  const emails = emailRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length === 0) return;

  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) {
    console.warn('ADMIN_BOOTSTRAP_EMAIL is set but ADMIN_BOOTSTRAP_PASSWORD is missing — skipping admin bootstrap');
    return;
  }
  if (password.length < 12) {
    console.warn('ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters — skipping admin bootstrap');
    return;
  }

  const passwordHash = await User.hashPassword(password);

  const permissions = (process.env.ADMIN_BOOTSTRAP_PERMISSIONS || '')
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  for (const email of emails) {
    const user = await User.findOne({ email });
    if (user) {
      if (user.role !== 'admin' || (permissions.length > 0 && permissions.join() !== (user.permissions || []).join())) {
        user.role = 'admin';
        if (permissions.length > 0) user.permissions = permissions;
        await user.save();
        console.log(`Admin bootstrap: updated ${email}${permissions.length > 0 ? ` with permissions: ${permissions.join(', ')}` : ''}`);
      }
      continue;
    }

    await User.create({
      email,
      passwordHash,
      name: process.env.ADMIN_BOOTSTRAP_NAME || email.split('@')[0],
      role: 'admin',
      permissions,
      emailVerified: true,
    });
    console.log(`Admin bootstrap: created admin account for ${email}${permissions.length > 0 ? ` with permissions: ${permissions.join(', ')}` : ''}`);
  }
}
