import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, sep } from 'path';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import bootstrapAdmin from './utils/bootstrapAdmin.js';
import Product from './models/Product.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: join(__dirname, '../.env.production') });
} else {
  dotenv.config({ path: join(__dirname, '../.env.development') });
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://plausible.io'],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", 'https://plausible.io'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === CLIENT_URL || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

const STATIC_SITEMAP_PAGES = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'shop', priority: '0.9', changefreq: 'daily' },
  { path: 'faq', priority: '0.6', changefreq: 'monthly' },
  { path: 'shipping', priority: '0.5', changefreq: 'monthly' },
  { path: 'returns', priority: '0.5', changefreq: 'monthly' },
  { path: 'payments', priority: '0.6', changefreq: 'monthly' },
  { path: 'privacy', priority: '0.3', changefreq: 'yearly' },
  { path: 'cookies', priority: '0.3', changefreq: 'yearly' },
  { path: 'terms', priority: '0.3', changefreq: 'yearly' },
  { path: 'about', priority: '0.6', changefreq: 'monthly' },
  { path: 'contact', priority: '0.6', changefreq: 'monthly' },
];

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const formatDate = (date) => new Date(date).toISOString();

app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .select('_id updatedAt')
      .lean();

    const staticUrls = STATIC_SITEMAP_PAGES.map(
      ({ path, priority, changefreq }) => {
        const lastmod = new Date().toISOString();
        return `  <url>\n    <loc>${CLIENT_URL}/${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
      }
    );

    const productUrls = products.map((p) => {
      return `  <url>\n    <loc>${CLIENT_URL}/product/${xmlEscape(p._id)}</loc>\n    <lastmod>${formatDate(p.updatedAt)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls.join(
      '\n'
    )}\n${productUrls.join('\n')}\n</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('sitemap generation failed:', err);
    res.status(500).send('Failed to generate sitemap');
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/dist'), {
    setHeaders: (res, filePath) => {
      if (filePath.includes(`${sep}assets${sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(__dirname, '../client/dist/index.html'));
    }
  });
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Image upload failed — max 5 MB allowed' });
  }
  if (err?.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      try {
        await bootstrapAdmin();
      } catch (err) {
        console.error('Admin bootstrap error:', err);
      }
      startServer();
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      console.log('Starting server without database connection...');
      startServer();
    });
} else {
  console.log('No MONGO_URI set — starting server without database');
  startServer();
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
