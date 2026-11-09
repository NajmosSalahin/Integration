import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Category from '../models/Category.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: process.env.ENV_FILE || join(__dirname, '../../.env.development') });

const MONGO_URI = process.env.MONGO_URI;
const args = process.argv.slice(2);
const reset = args.includes('--reset');
const force = args.includes('--force');

const SIZES = ['S', 'M', 'L', 'XL'];

const products = [
  {
    title: 'Essential Tee — Black',
    description: 'A heavyweight cotton tee with a clean, boxy cut. The kind of black tee that works with everything and never looks out of place.',
    price: 450,
    images: ['/demo/products/essential-black.svg'],
    tags: ['tees', 'black', 'minimal', 'essential'],
    featured: true,
    homeCollection: true,
    collectionOrder: 1,
  },
  {
    title: 'Essential Tee — White',
    description: 'Crisp white cotton with a soft hand feel and a relaxed shoulder. A blank canvas for the rest of your outfit.',
    price: 450,
    images: ['/demo/products/essential-white.svg'],
    tags: ['tees', 'white', 'minimal', 'essential'],
    homeCollection: true,
    collectionOrder: 2,
  },
  {
    title: 'Oversized Tee — Sand',
    description: 'Dropped shoulders, extended hem, and a washed sand tone. Built for slow weekends and easy layering.',
    price: 520,
    images: ['/demo/products/oversized-sand.svg'],
    tags: ['tees', 'oversized', 'sand', 'relaxed'],
    featured: true,
    homeCollection: true,
    collectionOrder: 3,
  },
  {
    title: 'Graphic Tee — Wave',
    description: 'A minimal wave print on midweight cotton. Subtle from a distance, detailed up close.',
    price: 550,
    images: ['/demo/products/graphic-wave.svg'],
    tags: ['tees', 'graphic', 'wave', 'print'],
    featured: true,
    homeCollection: true,
    collectionOrder: 4,
  },
  {
    title: 'Everyday Hoodie — Charcoal',
    description: 'Brushed fleece, a double-layer hood, and a relaxed fit. The layer you reach for when the temperature drops.',
    price: 1150,
    images: ['/demo/products/hoodie-charcoal.svg'],
    tags: ['hoodies', 'charcoal', 'fleece', 'everyday'],
    featured: true,
    homeCollection: true,
    collectionOrder: 5,
  },
  {
    title: 'Zip Hoodie — Olive',
    description: 'A full-zip hoodie in a muted olive with ribbed cuffs and a clean front. Easy to throw on, easy to style.',
    price: 1250,
    images: ['/demo/products/hoodie-olive.svg'],
    tags: ['hoodies', 'olive', 'zip', 'outerwear'],
    homeCollection: true,
    collectionOrder: 6,
  },
  {
    title: 'Oxford Shirt — Navy',
    description: 'A structured long-sleeve Oxford in deep navy. Button it up or wear it open over a tee.',
    price: 850,
    images: ['/demo/products/shirt-navy.svg'],
    tags: ['long-sleeves', 'navy', 'oxford', 'shirt'],
    featured: true,
    homeCollection: true,
    collectionOrder: 7,
  },
  {
    title: 'Canvas Tote — Natural',
    description: 'A sturdy cotton canvas tote with reinforced handles. Groceries, books, or everything in between.',
    price: 350,
    images: ['/demo/products/tote-natural.svg'],
    tags: ['accessories', 'tote', 'canvas', 'natural'],
    homeCollection: true,
    collectionOrder: 8,
  },
];

const categories = [
  { name: 'Classic Tees', tag: 'tees', group: 'T-Shirts', icon: 'Shirt', home: true, order: 1 },
  { name: 'Hoodies', tag: 'hoodies', group: 'Outerwear', icon: 'Shirt', home: true, order: 2 },
  { name: 'Long Sleeves', tag: 'long-sleeves', group: 'Shirts', icon: 'Shirt', home: true, order: 3 },
  { name: 'Accessories', tag: 'accessories', group: 'Accessories', icon: 'ShoppingBag', home: false, order: 4 },
];

const banners = [
  { publicId: '/demo/banner-1.svg', label: 'Shop New Collection', alt: 'New Collection', cta: '/shop', order: 0 },
  { publicId: '/demo/banner-2.svg', label: 'Shop Street Essentials', alt: 'Street Essentials', cta: '/shop?tag=tees', order: 1 },
  { publicId: '/demo/banner-3.svg', label: 'Shop Featured Designs', alt: 'Featured Designs', cta: '/shop?tag=hoodies', order: 2 },
];

function buildProduct(doc) {
  return {
    ...doc,
    sizes: SIZES,
    sizeGuideNote: 'Standard fit. True to size.',
    stock: SIZES.map((size) => ({ size, inStock: true })),
    active: true,
  };
}

async function seed() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set. Copy .env.example to .env.development and fill in your database URL.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && !force) {
    console.error('Refusing to seed a production database. Pass --force only if you are certain.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  try {
    const existing = await Product.countDocuments();
    if (existing > 0 && !reset) {
      console.log(`Database already has ${existing} products. Pass --reset to replace demo data.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    if (reset) {
      await Promise.all([
        Product.deleteMany({}),
        Banner.deleteMany({}),
        Category.deleteMany({}),
      ]);
      console.log('Cleared existing products, banners, and categories.');
    }

    const createdProducts = await Product.insertMany(products.map(buildProduct));
    const createdCategories = await Category.insertMany(categories);
    const createdBanners = await Banner.insertMany(banners);

    console.log(`Seeded ${createdProducts.length} products, ${createdCategories.length} categories, and ${createdBanners.length} banners.`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((err) => {
  console.error('Demo seed failed:', err.message);
  process.exit(1);
});
