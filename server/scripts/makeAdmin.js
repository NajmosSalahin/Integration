import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const passwordIndex = args.indexOf('--password');
const password = passwordIndex >= 0 ? args[passwordIndex + 1] : undefined;
const permsIndex = args.indexOf('--permissions');
const permissions = permsIndex >= 0
  ? args[permsIndex + 1].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  : [];
const useProd = args.includes('--prod') || args.includes('--production');

const emails = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--password' || a === '--permissions') {
    i += 1;
    continue;
  }
  if (a.startsWith('--')) continue;
  emails.push(a.trim().toLowerCase());
}

const envPath = join(__dirname, useProd ? '../../.env.production' : '../../.env.development');
dotenv.config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error(`No MONGO_URI found in ${envPath}`);
  process.exit(1);
}
if (emails.length === 0) {
  console.error('Usage: node scripts/makeAdmin.js <email> [<email> ...] --password <password> [--permissions orders,products,coupons,banners,categories] [--prod]');
  process.exit(1);
}
if (!password) {
  console.error('A password is required. Pass --password <password> (minimum 12 characters).');
  process.exit(1);
}
if (password.length < 12) {
  console.error('Password must be at least 12 characters.');
  process.exit(1);
}

const VALID_PERMISSIONS = ['orders', 'products', 'coupons', 'banners', 'categories'];
const invalidPerms = permissions.filter((p) => !VALID_PERMISSIONS.includes(p));
if (invalidPerms.length > 0) {
  console.error(`Invalid permissions: ${invalidPerms.join(', ')} (valid: ${VALID_PERMISSIONS.join(', ')})`);
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);

  for (const email of emails) {
    const existing = await User.findOne({ email });
    if (existing) {
      if (permissions.length > 0) {
        existing.role = 'admin';
        existing.permissions = permissions;
        await existing.save();
        console.log(`${email} set to admin with permissions: ${permissions.join(', ')}`);
      } else if (existing.role === 'admin') {
        console.log(`${email} is already an admin`);
      } else {
        existing.role = 'admin';
        await existing.save();
        console.log(`Promoted ${email} to admin`);
      }
    } else {
      const passwordHash = await User.hashPassword(password);
      await User.create({
        email,
        passwordHash,
        name: email.split('@')[0],
        role: 'admin',
        permissions,
        emailVerified: true,
      });
      console.log(`Created admin account for ${email}${permissions.length > 0 ? ` with permissions: ${permissions.join(', ')}` : ''}`);
    }
  }

  console.log('Log in with the password you passed and change it immediately. Existing accounts keep their current password.');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('makeAdmin error:', err);
  process.exit(1);
});
