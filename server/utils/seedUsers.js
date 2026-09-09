import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env.development') });

const MONGO_URI = process.env.MONGO_URI;

const testUsers = [
  {
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123',
    role: 'customer',
  },
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
  },
];

async function seedUsers() {
  if (!MONGO_URI) {
    console.error('No MONGO_URI found in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const u of testUsers) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`${u.email} already exists, skipping`);
        continue;
      }

      const passwordHash = await User.hashPassword(u.password);
      await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        emailVerified: true,
      });
      console.log(`Created ${u.role}: ${u.email}`);
    }

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedUsers();
