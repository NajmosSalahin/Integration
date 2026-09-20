import cloudinary from '../utils/cloudinary.js';

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const folder = req.body.folder || 'integration/products';

  const stream = cloudinary.uploader.upload_stream(
    { folder, resource_type: 'image' },
    (err, result) => {
      if (err || !result) {
        console.error('Cloudinary upload error:', err);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
      res.json({
        publicId: `v${result.version}/${result.public_id}`,
        url: result.secure_url,
      });
    }
  );
  stream.end(req.file.buffer);
}