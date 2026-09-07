import mongoose from 'mongoose';
import Product from '../models/Product.js';

export async function getProducts(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const products = await Product.find({ active: true })
      .select('title price images tags stock sizes')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProduct(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const product = await Product.findOne({ _id: req.params.id, active: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('getProduct error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}
