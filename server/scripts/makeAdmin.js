import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const emailArg = args.find((a) => !a.startsWith('--'));
const passwordIndex = args.indexOf('--password');
const password = passwordIndex >= 0 ? args[passwordIndex + 1] : '[redacted]';
const useProd = args.includes('--prod') || args.includes('--production');

const envPath = join(__dirname, useProd ? '../../.env.production' : '../../.env.development');
dotenv.config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error(`No MONGO_URI found in ${envPath}`);
  process.exit(1);
}
if (!emailArg) {
  console.error('Usage: node scripts/makeAdmin.js <email> [--password <password>] [--prod]');
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();

async function run() {
  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
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
      emailVerified: true,
    });
    console.log(`Created admin account for ${email}`);
    if (passwordIndex < 0) {
      console.log('Temporary password is [redacted] — log in and change it immediately.');
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('makeAdmin error:', err);
  process.exit(1);
});