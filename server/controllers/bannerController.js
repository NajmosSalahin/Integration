import mongoose from 'mongoose';
import Banner from '../models/Banner.js';

export async function getBanners(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const banners = await Banner.find({ active: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error('getBanners error:', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
}

export async function getAllBannersAdmin(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error('getAllBannersAdmin error:', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
}

export async function createBanner(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const banner = await Banner.create({
      publicId: req.body.publicId,
      label: req.body.label ?? '',
      alt: req.body.alt ?? '',
      cta: req.body.cta ?? '/shop',
      order: req.body.order ?? 0,
      active: req.body.active ?? true,
    });

    res.status(201).json(banner);
  } catch (err) {
    console.error('createBanner error:', err);
    res.status(500).json({ error: 'Failed to create banner' });
  }
}

export async function updateBanner(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    const { publicId, label, alt, cta, order, active } = req.body;
    if (publicId !== undefined) banner.publicId = publicId;
    if (label !== undefined) banner.label = label;
    if (alt !== undefined) banner.alt = alt;
    if (cta !== undefined) banner.cta = cta;
    if (order !== undefined) banner.order = order;
    if (active !== undefined) banner.active = active;

    await banner.save();
    res.json(banner);
  } catch (err) {
    console.error('updateBanner error:', err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
}

export async function deleteBanner(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    banner.active = false;
    await banner.save();

    res.json({ message: 'Banner deactivated' });
  } catch (err) {
    console.error('deleteBanner error:', err);
    res.status(500).json({ error: 'Failed to deactivate banner' });
  }
}