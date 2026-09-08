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

export async function getAllProductsAdmin(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const products = await Product.find()
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('getAllProductsAdmin error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function createProduct(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { title, description, price, images, sizes, sizeGuideNote, tags, stock } = req.body;

    const productStock = stock || sizes.map((size) => ({ size, inStock: true }));

    const product = await Product.create({
      title,
      description,
      price,
      images,
      sizes,
      sizeGuideNote: sizeGuideNote || '',
      tags: tags || [],
      stock: productStock,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { title, description, price, images, sizes, sizeGuideNote, tags, stock } = req.body;

    if (sizes && sizes.length > 0) {
      const existingStockMap = new Map(product.stock.map((s) => [s.size, s.inStock]));
      const newStock = sizes.map((size) => ({
        size,
        inStock: existingStockMap.has(size) ? existingStockMap.get(size) : true,
      }));
      product.stock = newStock;
    }

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (images !== undefined) product.images = images;
    if (sizes !== undefined) product.sizes = sizes;
    if (sizeGuideNote !== undefined) product.sizeGuideNote = sizeGuideNote;
    if (tags !== undefined) product.tags = tags;
    if (stock !== undefined) product.stock = stock;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function deleteProduct(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.active = false;
    await product.save();

    res.json({ message: 'Product deactivated' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

export async function toggleStock(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const { size, inStock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const stockItem = product.stock.find((s) => s.size === size);
    if (stockItem) {
      stockItem.inStock = inStock;
    } else {
      product.stock.push({ size, inStock });
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('toggleStock error:', err);
    res.status(500).json({ error: 'Failed to toggle stock' });
  }
}
