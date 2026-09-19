import User from '../models/User.js';

export default async function bootstrapAdmin() {
  const emailRaw = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!emailRaw) return;

  const email = emailRaw.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) {
    console.warn('ADMIN_BOOTSTRAP_EMAIL is set but ADMIN_BOOTSTRAP_PASSWORD is missing — skipping admin bootstrap');
    return;
  }

  const user = await User.findOne({ email });
  if (user) {
    if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log(`Admin bootstrap: promoted ${email} to admin`);
    }
    return;
  }

  const passwordHash = await User.hashPassword(password);
  await User.create({
    email,
    passwordHash,
    name: process.env.ADMIN_BOOTSTRAP_NAME || 'Admin',
    role: 'admin',
    emailVerified: true,
  });
  console.log(`Admin bootstrap: created admin account for ${email}`);
}