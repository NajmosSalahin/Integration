import mongoose from 'mongoose';
import Category from '../models/Category.js';

export async function getCategories(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const categories = await Category.find({ active: true })
      .sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    console.error('getCategories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function getAllCategoriesAdmin(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const categories = await Category.find()
      .sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    console.error('getAllCategoriesAdmin error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function createCategory(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const existing = await Category.findOne({ tag: req.body.tag });
    if (existing) {
      return res.status(400).json({ error: 'Category tag already exists' });
    }

    const category = await Category.create({
      name: req.body.name,
      tag: req.body.tag,
      group: req.body.group,
      icon: req.body.icon ?? 'Shirt',
      image: req.body.image ?? '',
      home: req.body.home ?? false,
      order: req.body.order ?? 0,
    });

    res.status(201).json(category);
  } catch (err) {
    console.error('createCategory error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

export async function updateCategory(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { name, tag, group, icon, image, home, order, active } = req.body;

    if (tag !== undefined && tag !== category.tag) {
      const existing = await Category.findOne({ tag, _id: { $ne: category._id } });
      if (existing) {
        return res.status(400).json({ error: 'Category tag already exists' });
      }
      category.tag = tag;
    }
    if (name !== undefined) category.name = name;
    if (group !== undefined) category.group = group;
    if (icon !== undefined) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (home !== undefined) category.home = home;
    if (order !== undefined) category.order = order;
    if (active !== undefined) category.active = active;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error('updateCategory error:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

export async function deleteCategory(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.active = false;
    await category.save();

    res.json({ message: 'Category deactivated' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ error: 'Failed to deactivate category' });
  }
}