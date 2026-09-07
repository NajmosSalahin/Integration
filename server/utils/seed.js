import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env.development') });

const MONGO_URI = process.env.MONGO_URI;

const designs = [
  {
    title: 'SHADOW WAVE',
    description: 'A dark, flowing wave pattern that captures the essence of midnight streets. Heavy cotton, oversized fit. The design wraps across the chest with subtle tonal shifts that catch light differently at every angle.',
    price: 149900,
    images: [
      'https://picsum.photos/seed/shadow-wave/600/750',
      'https://picsum.photos/seed/shadow-wave-2/600/750',
      'https://picsum.photos/seed/shadow-wave-3/600/750',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeGuideNote: 'Runs true to size. Oversized fit — size down for a slimmer look.',
    stock: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: false },
    ],
    tags: ['streetwear', 'graphic'],
    active: true,
  },
  {
    title: 'NEON DRIFT',
    description: 'Minimal design, maximum impact. A single neon streak across a void-black base. The simplicity is the statement — clean lines, bold presence, no noise.',
    price: 129900,
    images: [
      'https://picsum.photos/seed/neon-drift/600/750',
      'https://picsum.photos/seed/neon-drift-2/600/750',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeGuideNote: 'Compact fit. Size up if between sizes.',
    stock: [
      { size: 'S', inStock: false },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    tags: ['neon', 'minimal'],
    active: true,
  },
  {
    title: 'KANJI STORM',
    description: 'Bold kanji characters erupt across the front in a controlled chaos of typography and energy. Each character was chosen for its visual weight and meaning — storm, resistance, identity.',
    price: 159900,
    images: [
      'https://picsum.photos/seed/kanji-storm/600/750',
      'https://picsum.photos/seed/kanji-storm-2/600/750',
      'https://picsum.photos/seed/kanji-storm-3/600/750',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeGuideNote: 'Standard fit. True to size.',
    stock: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    tags: ['kanji', 'bold'],
    active: true,
  },
  {
    title: 'VOID SERIES',
    description: 'Abstract geometric shapes dissolve into darkness. The design appears and disappears depending on the light — a shirt that changes with you throughout the day.',
    price: 139900,
    images: [
      'https://picsum.photos/seed/void-series/600/750',
      'https://picsum.photos/seed/void-series-2/600/750',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeGuideNote: 'Relaxed fit. Size down for a tighter silhouette.',
    stock: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: false },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: false },
    ],
    tags: ['abstract', 'dark'],
    active: true,
  },
  {
    title: 'REBEL MARK',
    description: 'The signature mark. Clean, confident, unmistakable. This is the piece that defines the collection — our logo rendered in a way that bridges refined and raw.',
    price: 149900,
    images: [
      'https://picsum.photos/seed/rebel-mark/600/750',
      'https://picsum.photos/seed/rebel-mark-2/600/750',
      'https://picsum.photos/seed/rebel-mark-3/600/750',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeGuideNote: 'Classic fit. Our most versatile sizing.',
    stock: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    tags: ['logo', 'classic'],
    active: true,
  },
  {
    title: 'GHOST PRINT',
    description: 'Barely there. The design lives in the space between visible and invisible — a tonal print that reveals itself only up close. For those who notice details.',
    price: 119900,
    images: [
      'https://picsum.photos/seed/ghost-print/600/750',
      'https://picsum.photos/seed/ghost-print-2/600/750',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeGuideNote: 'Slim fit. Size up for a relaxed feel.',
    stock: [
      { size: 'S', inStock: false },
      { size: 'M', inStock: true },
      { size: 'L', inStock: false },
      { size: 'XL', inStock: true },
    ],
    tags: ['subtle', 'ghost'],
    active: true,
  },
  {
    title: 'TOKYO NIGHTS',
    description: 'The electric hum of Shinjuku after dark — neon signs reflected in rain-slicked streets. This design captures that specific energy of a city that never fully sleeps.',
    price: 169900,
    images: [
      'https://picsum.photos/seed/tokyo-nights/600/750',
      'https://picsum.photos/seed/tokyo-nights-2/600/750',
      'https://picsum.photos/seed/tokyo-nights-3/600/750',
    ],
    sizes: ['M', 'L', 'XL'],
    sizeGuideNote: 'Oversized fit. Size down for standard fit.',
    stock: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: false },
    ],
    tags: ['city', 'neon'],
    active: true,
  },
  {
    title: 'DISTRICT 08',
    description: 'Urban grid pattern meets street-level energy. The numbered district system creates a sense of place — your block, your rules, your design.',
    price: 139900,
    images: [
      'https://picsum.photos/seed/district-08/600/750',
      'https://picsum.photos/seed/district-08-2/600/750',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeGuideNote: 'Standard fit. True to size.',
    stock: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    tags: ['urban', 'grid'],
    active: true,
  },
];

async function seed() {
  if (!MONGO_URI) {
    console.error('No MONGO_URI found in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} products. Clearing...`);
      await Product.deleteMany({});
    }

    const created = await Product.insertMany(designs);
    console.log(`Seeded ${created.length} products successfully`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
