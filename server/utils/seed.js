import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env.development') });

const MONGO_URI = process.env.MONGO_URI;

const PRICE = 450;
const HOODIE_PRICE = 950;

const plainTees = [
  { name: 'Premium Solid Black T-shirt', color: 'Black', tags: ['plain', 'solid', 'black'] },
  { name: 'Premium Pure White T-shirt', color: 'White', tags: ['plain', 'solid', 'white'] },
  { name: 'Premium Sand Beige T-shirt', color: 'Sand Beige', tags: ['plain', 'solid', 'beige'] },
  { name: 'Premium Olive Green T-shirt', color: 'Olive Green', tags: ['plain', 'solid', 'green'] },
  { name: 'Premium Navy Blue T-shirt', color: 'Navy Blue', tags: ['plain', 'solid', 'blue'] },
  { name: 'Premium Maroon Red T-shirt', color: 'Maroon Red', tags: ['plain', 'solid', 'red'] },
  { name: 'Premium Heather Grey T-shirt', color: 'Heather Grey', tags: ['plain', 'solid', 'grey'] },
];

const iuTees = [
  { name: 'Sotota Fountain ~ Islamic University ~ Premium Black T-shirt', design: 'Sotota Fountain', tags: ['iu', 'fountain', 'landmark', 'popular'] },
  { name: 'Shaheed Monument ~ Islamic University ~ Premium Black T-shirt', design: 'Shaheed Monument', tags: ['iu', 'monument', 'landmark'] },
  { name: 'Mukta Bangla ~ Islamic University ~ Premium Black T-shirt', design: 'Mukta Bangla', tags: ['iu', 'typography', 'bangla', 'popular'] },
  { name: 'Mofiz Lake Bridge ~ Islamic University ~ Premium Black T-shirt', design: 'Mofiz Lake Bridge', tags: ['iu', 'nature', 'bridge'] },
  { name: 'IUian Multi-Monument Retro ~ Islamic University ~ Premium Black T-shirt', design: 'Multi-Monument Retro', tags: ['iu', 'retro', 'multi'] },
  { name: 'IUian Grunge Element Strips ~ Islamic University ~ Premium Black T-shirt', design: 'Grunge Element Strips', tags: ['iu', 'grunge', 'strips'] },
  { name: 'IUian Festival Doodle Art ~ Islamic University ~ Premium Black T-shirt', design: 'Festival Doodle Art', tags: ['iu', 'doodle', 'festival'] },
  { name: 'IU Gate ~ Islamic University ~ Premium Black T-shirt', design: 'IU Gate', tags: ['iu', 'gate', 'landmark', 'popular'] },
  { name: 'SDS ~ Islamic University ~ Premium Black T-shirt', design: 'SDS', tags: ['iu', 'sds', 'typography'] },
  { name: 'Islamic University ~ Horizontal Strips ~ Premium Black T-shirt.png', display: 'Islamic University ~ Horizontal Strips ~ Premium Black T-shirt', design: 'Horizontal Strips', tags: ['iu', 'strips', 'minimal'] },
  { name: 'Central Mosque ~ Islamic University ~ Premium Black T-shirt', design: 'Central Mosque', tags: ['iu', 'mosque', 'landmark', 'popular'] },
];

const hoodies = [
  { name: 'Premium Chocolate Brown Hoodie', color: 'Chocolate Brown', price: HOODIE_PRICE, tags: ['premium', 'chocolate', 'brown'] },
];

const aestheticTees = [
  { name: 'Mount Fuji Torii ~ Premium Solid Black T-shirt', design: 'Mount Fuji Torii', tags: ['japanese', 'mountain', 'torii', 'minimal'] },
  { name: 'Oriental Mountain Landscape ~ Premium Solid Black T-shirt', design: 'Oriental Mountain Landscape', tags: ['japanese', 'landscape', 'nature'] },
  { name: 'Ramen Neko ~ Premium Solid Black T-shirt', design: 'Ramen Neko', tags: ['japanese', 'ramen', 'cute', 'illustration'] },
  { name: 'Retro Fallout ~ Premium Black T-shirt', design: 'Retro Fallout', tags: ['retro', 'vintage', 'text'] },
  { name: 'What If It Works Out ~ Premium Solid Black T-shirt', design: 'What If It Works Out', tags: ['motivational', 'text', 'minimal'] },
  { name: 'Offline Life Is The Ultimate Luxury ~ Premium Solid Black T-shirt', design: 'Offline Life Is The Ultimate Luxury', tags: ['lifestyle', 'text', 'minimal'] },
  { name: 'Kneeling Skeleton Lotus ~ Premium Solid Black T-shirt', design: 'Kneeling Skeleton Lotus', tags: ['spiritual', 'skeleton', 'lotus', 'illustration'] },
  { name: 'Serendipity ~ Premium Solid Black T-shirt', design: 'Serendipity', tags: ['serendipity', 'minimal', 'text'] },
  { name: 'Where Am I ~ Premium Solid Black T-shirt', design: 'Where Am I', tags: ['introspective', 'text', 'minimal'] },
];

function loadUrls() {
  const raw = readFileSync(join(__dirname, 'uploaded_urls.json'), 'utf-8');
  return JSON.parse(raw);
}

function buildProducts(urls) {
  const products = [];

  for (const tee of plainTees) {
    products.push({
      title: tee.name,
      description: `Premium solid ${tee.color} t-shirt from Integration. Heavy cotton, clean finish. A versatile essential that works across every setting — minimal design, maximum quality.`,
      price: tee.price || PRICE,
      images: urls[tee.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['mens-tshirts', ...tee.tags],
      active: true,
    });
  }

  for (const tee of iuTees) {
    products.push({
      title: tee.display || tee.name,
      description: `Premium black t-shirt featuring the "${tee.design}" design representing Islamic University. Heavy cotton, bold print. For those who carry their campus pride everywhere.`,
      price: tee.price || PRICE,
      images: urls[tee.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['iu-tshirts', ...tee.tags],
      active: true,
    });
  }

  for (const item of hoodies) {
    products.push({
      title: item.name,
      description: `Premium ${item.color} hoodie from Integration. Heavy fleece, clean cut, everyday comfort. The layer you reach for when you want both warmth and style.`,
      price: item.price,
      images: urls[item.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['hoodies', ...item.tags],
      active: true,
    });
  }

  for (const tee of aestheticTees) {
    products.push({
      title: tee.display || tee.name,
      description: `Premium solid black t-shirt featuring the "${tee.design}" design. Heavy cotton, clean print. A statement piece for those who wear their mood, their mind, and their aesthetic.`,
      price: tee.price || PRICE,
      images: urls[tee.name] || [],
      sizes: ['S', 'M', 'L', 'XL'],
      sizeGuideNote: 'Standard fit. True to size.',
      stock: [
        { size: 'S', inStock: true },
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
      ],
      tags: ['aesthetic-tshirts', ...tee.tags],
      active: true,
    });
  }

  return products;
}

async function seed() {
  if (!MONGO_URI) {
    console.error('No MONGO_URI found in environment');
    process.exit(1);
  }

  try {
    const urls = loadUrls();
    console.log(`Loaded ${Object.keys(urls).length} uploaded image URLs`);

    const products = buildProducts(urls);
    console.log(`Prepared ${products.length} products for seeding`);

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database has ${count} products. Clearing...`);
      await Product.deleteMany({});
    }

    const created = await Product.insertMany(products);
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
